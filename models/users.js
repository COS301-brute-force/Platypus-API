/**
 * @file This file defines the schema for the Users document in the DB.
 */
var debug       = require('debug')('platypus-api:models:users');
var mongoose    = require('mongoose');
var Claims      = require('./claims');

// Typedefs for easier usage.
var ObjectId    = mongoose.Schema.Types.ObjectId;
var Schema      = mongoose.Schema;

debug('Defining schema: Session');
var Users = Schema({
  _id               : ObjectId,
  u_id              : String,
  u_nickname        : String,
  u_color           : String,
  item_claimed      : [{ type: ObjectId, ref: 'Claims' }]
});

debug('Users model exported');
module.exports = mongoose.model('Users', Users);
