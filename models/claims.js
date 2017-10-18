/**
 * @file This file defines the schema for item claims by users.
 */
var bcrypt      = require('bcryptjs');
var debug       = require('debug')('platypus-api:models:claims');
var mongoose    = require('mongoose');

// Typedefs for easier usage.
var Schema      = mongoose.Schema;
var ObjectId    = mongoose.Schema.Types.ObjectId;

debug('Defining schema: Claims');
var Claims = Schema({
  _id       : ObjectId,
  item_id   : String,
  quantity  : Number
});

module.exports = mongoose.model('Claims', Claims);
