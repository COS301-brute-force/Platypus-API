/**
 * @file This file implements the defined routes for use by the mobile
 * componant. As well as helper functions for these routes.
 */
var mongoose    = require('mongoose');
var Bills     = require('../models/bills');
var Users     = require('../models/users');
var Items       = require('../models/items');
var debug     = require('debug')('platypus-api:controllers:mobile');
var fs        = require('fs');
var multer    = require('multer');
var ocr       = require('./ocr');
//var io        = require('socket.io').listen(3002);
var MTypes      = mongoose.Types;
var Schema      = mongoose.Schema;
var mobileHelper = require('../helpers/mobile');

debug('Exporting method: createSession');
/**
 * Function that receives the user data (Nickname and profile color) entered
 * when a user requests a new session. A new user is created. A new bill and
 * session are also created. The new user is then added to the bill.
 * @param {request} req req used by Express.js to fetch data from the client.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return JSON object containing session ID and user ID
 */
module.exports.createSession = function(req, res, next){
  var nickname = req.body.nickname;
  var user_color = req.body.color;
  var b_id = mobileHelper.mobile.generateBillID();
  var user_added = "";
  debug("Nickname: " + nickname + ", Color: " + user_color, ", For bill ID: " + b_id);

  var bill = new Bills({
    _id         : new MTypes.ObjectId(),
    bill_id     : b_id,
    bill_image  : "",
    users_count : 0,
    items_count : 0,
    users       : [],
    bill_items  : []
  });

  bill.save(function(err) {
    if (err) {
      /**
      *  TODO: Create Error class for db errors
      */
      debug(err);
    }
    user_added = addUserToDB(b_id, req.body.nickname, req.body.color).then(function (uid_response) {
      var response = {
        data: {
          type: 'bill',
          id: 0,
          attributes: {
            session_id: bill.bill_id,
            user_id: uid_response
          }
        }
      };

      debug("Session ID: " + response.data.attributes.session_id + ", User ID: " + response.data.attributes.user_id);
      debug('Sending response (status: 200)');
      return res.status(200).send(response);
    });
  });
}

debug('Exporting method: joinSession');
/**
 * This route is called to allow a new user to join an existing session. Data
 * is fetched from the client. addUserToDB() is then called to perform the
 * adding of new client data to the session.
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Used to fetch: req.body.session_id, req.body.nickname
 *                      and req.body.color from the client.
 * @param {response} res res used by Express.js to send HTTP responses back to
 *                       the client.
 * @param {object} next
 * @return HTTP status 200 using res.send().
 */
module.exports.joinSession = function(req, res, next){
  addUserToDB(req.body.session_id, req.body.nickname, req.body.color).then(function (uid_response) {
    var response = {
      data: {
        type: 'bill',
        id: 0,
        attributes: {
          user_id: uid_response
        }
      }
    };
    debug('Sending response (status: 200)');
    return res.status(200).send(response);
  });
}

debug("Exporting method sendImage");
/**
 * Function call to upload a file to the server. Image is saved in ./uploads.
 * Image name is added to the database.
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Used to fetch session_id from req.body.session_id and
 *                      the file name from req.body.originalname.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return HTTP status 200 using res.send().
 */
module.exports.sendImage = function(req, res, next){
  debug("Image function called");
  var tmp_path = req.file.path;
  var target_path = './uploads/' + req.file.originalname;
  fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      fs.unlink(tmp_path, function() {
          if (err) throw err;
          // TODO: Function call to OCR module
          debug('File uploaded to: ' + target_path + ' - ' + req.file.size + ' bytes');
          ocr.detect(target_path,req.body.session_id).then((data)=>{
            populateItems(data.data.attributes.items, req.body.session_id);
            var query = Bills.where({bill_id: req.body.session_id});
            query.update({$set: {bill_image : req.file.originalname}}).exec();
          
            debug('Sending response (status: 200)');
            res.status(200).send("Success");
          });
      });
  });
}

/**
 * This module will terminate the existing session when called.
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Session is fetched from req.body.session_id.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @returns HTTP status 200 using res.send().
 */
module.exports.terminateSession = function(req, res, next){
  debug("Terminate Session called");

  var session = req.body.session_id;
  var query = Bills.find({bill_id: session});

  query.remove({users: {$size: 0}}, function(err) {
    if (err) return handleError(err);
  });
  debug('Sending response (status: 200)');
  res.status(200).send("Success");
}

/**
 * This function is called to add a new user to the database for the current
 * bill session.
 * @param {bill_id} session_id This is the unique session ID to find the correct
 *                             Session to add the user to.
 * @param {String} nname This is the name of the new user.
 * @param {String} ucolor The color selected by the user
 */
function addUserToDB(session_id, nname, ucolor) {
  return new Promise(function (resolve, reject) {
    var finalid = null;
    Bills.findOne({bill_id: session_id}, function(err, doc){
      if (err || doc===null) {
        console.log("Bill not found!");
        // TODO: Fix error handling
        return 0;
      }
      var bill_session = doc;
      var user_count = bill_session.users_count;
      var nickname = nname;
      var user_color = ucolor;
      var user_id = session_id+mobileHelper.mobile.getUserId(user_count);
      var user_owner = (user_count == 0);

      debug(user_count);

      debug("Adding user: uid = " + user_id + ", uOwner = " + user_owner + ", uNickname = " + nickname + ", uColor = " + user_color);

      var user = new Users({
        _id         : new MTypes.ObjectId(),
        u_id          : user_id,
        u_owner       : Boolean,
        u_nickname    : nickname,
        u_color       : user_color
      });

      bill_session.users.push(user);
      var subdoc = bill_session.users[user_count];
      subdoc.isNew;
      bill_session.users_count = user_count+1;

      bill_session.save(function (err) {
        if (err) return handleError(err);
        user.save(function(err){
          if (err) return handleError(err);
        });
      });
      debug("Added obj: " + bill_session.users[user_count-1]);
      resolve(user_id);
    });
  });
}

module.exports.getAllSessionData = function(req, res, next){
  var session = req.body.session_id;
  // @todo: Fix item limit
  Bills.findOne({bill_id: session}).populate({path:'bill_items'}).exec(function(err, sess){
    debug("sess:");
    debug(sess);
    var response = {
      data: {
        type: 'session_data',
        id: 0,
        attributes: {
          items: sess.bill_items
        }
      }
    };
    debug("SessionData");
    debug(response.data.attributes.items);
    debug('Sending response (status: 200)');
    return res.status(200).send(response);
  });
}

function populateItems(items, session_id) {
  Bills.findOne({bill_id: session_id}, function(err, doc){
      items.forEach(function(iter) {
          debug("Loop runs");
          var itid = session_id+getItemId(doc.items_count);
          var item = new Items({
              _id           : new MTypes.ObjectId(),
              i_id       : itid,
              i_name     : iter.desc,
              i_quantity : iter.quantity,
              i_price    : iter.price
          });
          doc.bill_items.push(item);
          var subdoc = doc.bill_items[doc.items_count];
          subdoc.isNew;
          doc.items_count += 1;
          item.save(function(err){
            if (err) return handleError(err);
          });
      });
      doc.save(function (err) {
          if (err) return handleError(err);
      });
      debug("Added item: " + doc.items_count);
      debug(doc.bill_items);
  });
}

function getItemId(num) {
  var new_iID = (num + 1).toString();

  if (new_iID.length < 2) {
      new_iID = 'i0' + new_iID;
  }
  else {
      new_iID = 'i' + new_iID;
  }
  return new_iID;
}