/**
 * @file This file implements the socket.io function in order ot facilitate
 * live communication between clients as part of the same session.
 */
var config = require('config');
var debug = require('debug')('platypus-api:controllers:mobile');
var io = require('socket.io').listen(config.servers.io.port);
var billHelper = require('../helpers/database').bill;

debug('Exporting method: connectSessionSocket');
var socket;
/**
 * Starts the connection socket for the communication, and starts the listenerHandler.
 */
io.on('connection', function (sock) {
	socket = sock;
	listenerHandler();
});

/**
 * This function ensures that the server listens for events from other clients.
 */
function listenerHandler() {
	socket.on('claimItem', claimItem);
	socket.on('unclaimItem', unclaimItem);
	socket.on('createItem', createItem);
	socket.on('deleteItem', deleteItem);
	socket.on('editItem', editItem);
}

/**
 * This function is called when a user claims an item. It calls the helper
 * function billHelper.claimItem, to make the changes on the DB. Then sendItem
 * and sendUnclaimedTotal are called to update the other clients in the session.
 * @param {JSON} data data object containing the changes to be made in the DB.
 * It contains the session_id.
 */
function claimItem(data) {
	billHelper.claimItem(data).then(function(item_response){
		sendItem(item_response.i_response, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
};

/**
 * This function is called when a user unclaims an item. It calls the helper
 * function billHelper.unclaimItem, to make the changes on the DB. Then sendItem
 * and sendUnclaimedTotal are called to update the other clients in the session.
 * @param {JSON} data data object containing the changes to be made in the DB.
 * It contains the session_id.
 */
function unclaimItem(data) {
	billHelper.unclaimItem(data).then(function(item_response){
		sendItem(item_response.i_response, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
};

/**
 * This function is called when an item is to be deleted. It calls the helper
 * function billHelper.deleteItem, to make the changes on the DB. Then
 * sendRemoveItem,sendTotal and sendUnclaimedTotal are called to update the
 * other clients in the session.
 * @param {JSON} data data object containing the changes to be made in the DB.
 * It contains the session_id.
 */
function deleteItem(data) {
	billHelper.deleteItem(data).then(function(item_response) {
		debug("Delete Item Called");
		sendRemoveItem(item_response.i_id, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
}

/**
 * This function is called when an item is created. It calls the helper
 * function billHelper.addItemToDB, to make the changes on the DB. Then
 * sendItem, sendTotal and sendUnclaimedTotal are called to update the other
 * clients in the session.
 * @param {JSON} data data object containing the changes to be made in the DB.
 * It contains the session_id.
 */
function createItem(data) {
	debug("createItem: SessionID: " + data.session_id + "price, name, quantity");
	billHelper.addItemToDB(data.session_id, data.price, data.name, data.quantity).then(function (item_response) {
		sendItem(item_response.i_response, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
}

/**
 * This function is called when an item is edited. It calls the helper
 * function billHelper.editItem, to make the changes on the DB. Then
 * sendItem, sendTotal and sendUnclaimedTotal are called to update the other
 * clients in the session.
 * @param {JSON} data data object containing the changes to be made in the DB.
 * It contains the session_id.
 */
function editItem(data) {
	debug("editItem: SessionID: " + data.session_id + " Price: " + data.price + " Name: " + data.name + " Quantity: " + data.quantity + " ItemID: " + data.item_id);
	billHelper.editItem(data).then(function (item_response) {
		sendItem(item_response.i_response, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
}

/**
 * This function sends the updated item to all other clients that are in the
 * session. This is done with the socket.io function io.emit();
 * @param {JSON} it This contains the updated details for the item.
 * @param {ObjectID} session_id The ID of the session which will be communicated to.
 */
function sendItem(it, session_id) {
	debug("Sending Item for session: " + session_id);
	debug(it);
	var response = {
		data: {
			type: 'new_item',
			id: 0,
			attributes: {
				session_id: session_id,
				item: it
			}
		}
	};
	io.emit("sendItem", response);
}

/**
 * This function sends the updated total to all other clients that are in the
 * session. This is done with the socket.io function io.emit();
 * @param {NUMBER} total This contains the updated details for the total.
 * @param {ObjectID} session_id The ID of the session which will be communicated to.
 */
function sendTotal(total, session_id) {
	debug("Sending Total for session: " + session_id);
	debug(total);
	var response = {
		data: {
			type: 'updated_total',
			id: 0,
			attributes: {
				session_id: session_id,
				n_total: total
			}
		}
	};
	io.emit("updateTotal", response);
}

/**
 * This function sends the updated unclaimedTotal to all other clients that are
 * in the session. This is done with the socket.io function io.emit();
 * @param {NUMBER} utotal This contains the updated details for the unclaimedTotal.
 * @param {ObjectID} session_id The ID of the session which will be communicated to.
 */
function sendUnclaimedTotal(utotal, session_id) {
	debug("Sending Unclaimed Total for session: " + session_id);
	debug("uTotal:" + utotal);
	var response = {
		data: {
			type: 'updated_unclaimed_total',
			id: 0,
			attributes: {
				session_id: session_id,
				bill_unclaimed_total: utotal
			}
		}
	};
	io.emit("updateUnclaimedTotal", response);
}

/**
 * This function sends the removed item to all other clients that are in the
 * session, for them to udate. This is done with the socket.io function io.emit();
 * @param {JSON} item_id This contains the updated details for the removed item.
 * @param {ObjectID} session_id The ID of the session which will be communicated to.
 */
function sendRemoveItem(item_id, session_id) {
	debug("Sending RemoveItem for session: " + session_id);
	debug(item_id);
	var response = {
		data: {
			type: 'updated_unclaimed_total',
			id: 0,
			attributes: {
				session_id: session_id,
				i_id: item_id
			}
		}
	};
	io.emit("removeItem", response);
}
