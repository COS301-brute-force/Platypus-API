/**
 * @file This file defines the schema for the Bill document for the DB.
 */
var bcrypt = require('bcryptjs');
var debug = require('debug')('platypus-api:models:bills');
var mongoose = require('mongoose');
var Items = require('./items');
var Users = require('./users');

// Typedefs for easier usage.
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

debug('Defining schema: Bills');
var Bills = Schema({
	_id: ObjectId,
	bill_id: { type: String, index: { unique: true } },
	bill_image: String,
	users_count: Number,
	items_count: Number,
	users: [{ type: ObjectId, ref: 'Users' }],
	bill_items: [{ type: ObjectId, ref: 'Items' }],
	bill_total: Number,
	bill_unclaimed_total: Number,
	bill_owner: String
}, {
	toJSON: { virtuals: true }
});

module.exports = mongoose.model('Bills', Bills);
