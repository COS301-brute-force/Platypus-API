/**
 * @file This file implements functions for the socket.io listener
 */
var debug = require('debug')('platypus-api:controllers:mobile');
var io = require('socket.io').listen(3002);
var billHelper = require('../helpers/database').bill;

/**
 * @type socket variable that acts as socket handle
 */
var socket;
io.on('connection', function (sock) {
	socket = sock;
	listenerHandler();
});

debug('Exporting method: listenerHandler');
/**
 * Function that initialises all listeners for socket communication
 */
function listenerHandler() {
	socket.on('claimItem', claimItem);
	socket.on('unclaimItem', unclaimItem);
	socket.on('createItem', createItem);
	socket.on('deleteItem', deleteItem);
	socket.on('editItem', editItem);
}

debug('Exporting method: claimItem');
/**
 * Socket function to claim bill item
 * @param {object} data used to send data to the handler function
 * @return JSON object containing the item response and the updated
 * total
 */
function claimItem(data) {
	billHelper.claimItem(data).then(function(item_response){
		sendItem(item_response.i_response, data.session_id);
		sendUnclaimedTotal(item_response.new_unclaimed_total, data.session_id);
	});
};

debug('Exporting method: unclaimItem');
/**
 * Socket function to unclaim bill item
 * @param {object} data used to send data to the handler function
 * @return JSON object containing the item response and the updated
 * total
 */
function unclaimItem(data) {
	billHelper.unclaimItem(data).then(function(item_response){
		sendItem(item_response.i_response, data.session_id);
		sendUnclaimedTotal(item_response.new_unclaimed_total, data.session_id);
	});
};

debug('Exporting method: deleteItem');
/**
 * Socket function to delete bill item
 * @param {object} data used to send data to the handler function
 * @return JSON object containing the item response and the updated
 * totals
 */
function deleteItem(data) {
	billHelper.deleteItem(data).then(function(item_response) {
		debug("Delete Item Called");
		sendRemoveItem(item_response.i_id, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.new_unclaimed_total, data.session_id);
	});
}

debug('Exporting method: createItem');
/**
 * Socket function to create bill item
 * @param {object} data used to send data to the handler function
 * @return JSON object containing the item response and the updated
 * totals
 */
function createItem(data) {
	debug("createItem: SessionID: " + data.session_id + "price, name, quantity");
	billHelper.addItemToDB(data.session_id, data.price, data.name, data.quantity).then(function (item_response) {
		sendItem(item_response.item, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.new_unclaimed_total, data.session_id);
	});
}

debug('Exporting method: editItem');
/**
 * Socket function to edit bill item
 * @param {object} data used to send data to the handler function
 * @return JSON object containing the item response and the updated
 * totals
 */
function editItem(data) {
	debug("editItem: SessionID: " + data.session_id + " Price: " + data.price + " Name: " + data.name + " Quantity: " + data.quantity + " ItemID: " + data.item_id);
	billHelper.editItem(data).then(function (item_response) {
		sendItem(item_response.i_response, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.new_unclaimed_total, data.session_id);
	});
}

debug('Exporting method: sendItem');
/**
 * Socket function to broadcast a bill item after change
 * @param {object} it used to send data to the handler function
 * @param {string} session_id used to broadcast id
 * @return JSON object containing the item response and the sessionID
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

debug('Exporting method: sendTotal');
/**
 * Socket function to broadcast a changed total
 * @param {object} total used to broadcast total
 * @param {string} session_id used to broadcast id
 * @return JSON object containing the session id and the 
 * updated totals
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

debug('Exporting method: sendUnclaimedTotal');
/**
 * Socket function to broadcast a changed total
 * @param {object} uTotal used to broadcast total
 * @param {string} session_id used to broadcast id
 * @return JSON object containing the item response and the 
 * updated totals
 */
function sendUnclaimedTotal(utotal, session_id) {
	debug("Sending Unclaimed Total for session: " + session_id);
	debug(utotal);
	var response = {
		data: {
			type: 'updated_unclaimed_total',
			id: 0,
			attributes: {
				session_id: session_id,
				n_unclaimed_total: utotal
			}
		}
	};
	io.emit("updateUnclaimedTotal", response);
}

debug('Exporting method: sendItem');
/**
 * Socket function to broadcast a bill item after delete
 * @param {object} item_id used to send data to the handler function
 * @param {string} session_id used to send session_id
 * @return JSON object containing the item response and the sessionID
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