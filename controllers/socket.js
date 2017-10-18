/**
 * @file This file implements the defined routes for use by the mobile
 * component.
 */
var config = require('config');
var debug = require('debug')('platypus-api:controllers:mobile');
var io = require('socket.io').listen(config.servers.io.port);
var billHelper = require('../helpers/database').bill;

debug('Exporting method: connectSessionSocket');
/**
 * Function that receives the user data (Nickname and profile color) entered
 * when a user requests a new session.
 * @param {request} req req used by Express.js to fetch data from the client.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return JSON object containing session ID and user ID
 */


var socket;
io.on('connection', function (sock) {
	socket = sock;
	listenerHandler();
});

function listenerHandler() {
	socket.on('claimItem', claimItem);
	socket.on('unclaimItem', unclaimItem);
	socket.on('createItem', createItem);
	socket.on('deleteItem', deleteItem);
	socket.on('editItem', editItem);
}

function claimItem(data) {
	billHelper.claimItem(data).then(function(item_response){
		sendItem(item_response.i_response, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
};

function unclaimItem(data) {
	billHelper.unclaimItem(data).then(function(item_response){
		sendItem(item_response.i_response, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
};

function deleteItem(data) {
	billHelper.deleteItem(data).then(function(item_response) {
		debug("Delete Item Called");
		sendRemoveItem(item_response.i_id, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
}

function createItem(data) {
	debug("createItem: SessionID: " + data.session_id + "price, name, quantity");
	billHelper.addItemToDB(data.session_id, data.price, data.name, data.quantity).then(function (item_response) {
		sendItem(item_response.i_response, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
}

function editItem(data) {
	debug("editItem: SessionID: " + data.session_id + " Price: " + data.price + " Name: " + data.name + " Quantity: " + data.quantity + " ItemID: " + data.item_id);
	billHelper.editItem(data).then(function (item_response) {
		sendItem(item_response.i_response, data.session_id);
		sendTotal(item_response.new_total, data.session_id);
		sendUnclaimedTotal(item_response.bill_unclaimed_total, data.session_id);
	});
}


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
