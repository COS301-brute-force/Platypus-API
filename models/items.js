/**
 * @file This file defines the schema for the Items document in the DB.
 */
var bcrypt      = require('bcryptjs');
var debug       = require('debug')('platypus-api:models:items');
var mongoose    = require('mongoose');

// Typedefs for easier usage.
var ObjectId    = mongoose.Schema.Types.ObjectId;
var Schema      = mongoose.Schema;

debug('Defining schema: Session');
var Items = Schema({
  _id           : ObjectId,
  i_id       : String,
  i_name     : String,
  i_quantity : Number,
  i_price    : Number
});

debug('Items model exported');
module.exports = mongoose.model('Items', Items);
