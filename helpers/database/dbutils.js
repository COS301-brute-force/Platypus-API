/**
 * @file This file implements database utility functions for the generatrion of
 * IDs for the bill, items and users that are added to a session.
 */

var mongoose = require('mongoose');
var Bills = require('../../models/bills');
var Users = require('../../models/users');
var Items = require('../../models/items');
var MTypes = mongoose.Types;
var debug = require('debug')('platypus-api:helpers:dbutils');

/**
 * This function generates a random ID for each individual session as its
 * created.
 * @return {String} A string of 5 characters that will be the session ID.
 */
module.exports.generateBillID = function () {
	var alphabet = 'abcdefghjklmnopqrstvwxyz';
	var numbers = '0123456789';
	var bill_id_temp = "";

		for (var i = 0; i < 5; i++) {
			var char_or_int = (Math.floor(Math.random() * 2));

			if (char_or_int === 0) {
				var alphabet_index = (Math.floor(Math.random() * 24));
				bill_id_temp = bill_id_temp + alphabet.charAt(alphabet_index);
			} else {
				var numbers_index = (Math.floor(Math.random() * 10));
				bill_id_temp = bill_id_temp + numbers.charAt(numbers_index);
			}
		}

		Bills.find({
			bill_id: bill_id_temp
		}).exec(function (err, res) {
			if (res.length || err != null) {
				console.log('Error: Session ID exists!');
				return false;
			}
		});
	return bill_id_temp;
}

/**
 * This function generates an ID for a user based on the session they are a part
 * of.
 * @return {String} The unique User ID.
 */
module.exports.getUserId = function (num) {
	var new_uid = (num + 1).toString();

	if (new_uid.length < 2) {
		new_uid = 'u0' + new_uid;
	} else {
		new_uid = 'u' + new_uid;
	}
	return new_uid;
}

/**
 * This function generates an ID for an item based on the session it is a part
 * of.
 * @return {String} The unique Item ID.
 */
module.exports.getItemId = function (num) {
  var new_iID = (num + 1).toString();

  if (new_iID.length < 2) {
    new_iID = 'i0' + new_iID;
  } else {
    new_iID = 'i' + new_iID;
  }
  return new_iID;
}
