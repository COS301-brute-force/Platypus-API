/**
 * @file This file implements the defined routes for use by the mobile
 * componant. As well as helper functions for these routes.
 */
var debug = require('debug')('platypus-api:controllers:mobile');
var fs = require('fs');
var ocr = require('./ocr');
var billHelper = require('../helpers/database').bill;

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
module.exports.createSession = function (req, res, next) {
  debug("Calling create session");
  var nickname = req.body.nickname;
  var user_color = req.body.color;
  billHelper.createSession().then(function(bill_session_id){
    debug("Nickname: " + nickname + ", Color: " + user_color, ", For bill ID: " + bill_session_id);
    billHelper.addUserToDB(bill_session_id, nickname, user_color).then(function(uid_response){
      var response = {
        data: {
          type: 'bill',
          id: 0,
          attributes: {
            session_id: bill_session_id,
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
 * is fetched from the client. Helper function fetchBillData is used to fetch
 * data from the DB. Helper function addUserToDB() is then called to perform the
 * adding of new client data to the session.
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Used to fetch: req.body.session_id, req.body.nickname
 *                      and req.body.color from the client.
 * @param {response} res res used by Express.js to send HTTP responses back to
 *                       the client.
 * @param {object} next
 * @return JSON object containing new User ID and Bill object.
 */
module.exports.joinSession = function (req, res, next) {
  billHelper.fetchBillData(req.body.session_id).then(function(bill_object){
    billHelper.addUserToDB(req.body.session_id, req.body.nickname, req.body.color).then(function (uid_response) {
      var response = {
        data: {
          type: 'bill',
          id: 0,
          attributes: {
            user_id: uid_response,
            bill: bill_object
          }
        }
      };
      debug('Sending response (status: 200)');
      return res.status(200).send(response);
    });
  });
}

debug("Exporting method sendImage");
/**
 * Function call to upload a file to the server. Image is saved in ./uploads.
 * Image name is added to the database. OCR module is informed of the image
 * file. Character recognition is performed and a text response is received
 * from OCR module, and processed
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Used to fetch session_id from req.body.session_id and
 *                      the file name from req.body.originalname.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return HTTP status 200 using res.send().
 */
module.exports.sendImage = function (req, res, next) {
  debug("Image function called");
  var tmp_path = req.file.path;
  var target_path = './uploads/' + req.file.originalname;
  fs.rename(tmp_path, target_path, function (err) {
    if (err) throw err;
    fs.unlink(tmp_path, function () {
      if (err) throw err;
      debug('File uploaded to: ' + target_path + ' - ' + req.file.size + ' bytes');
      ocr.detect(target_path, req.body.session_id).then((data) => {
        billHelper.populateItems(data.data.attributes.items, req.body.session_id, req.file.originalname).then(function (){
          debug('Sending response (status: 200)');
          res.status(200).send("Success");
        });
      });
    });
  });
}

debug("Exporting method getAllSessionData");
/**
 * Function to featch data from database.
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Used to fetch session_id from req.body.session_id.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return HTTP status 200 using res.send(). Returns a JSON object containing
 * Session Data
 */
module.exports.getAllSessionData = function(req, res, next) {
  var b_id = req.body.session_id;
  billHelper.fetchBillItems(b_id).then(function (items_response) {
    debug("getAllSessionData returns:");
    debug(items_response);
    return res.status(200).send(items_response);
  });
}

debug("Exporting method getAllSessionData");
module.exports.getItems = function(req, res, next) {
  var b_id = req.body.session_id;
  billHelper.fetchBillItems(b_id).then(function (items_response) {
    debug("getItems returns:");
    debug(items_response);
    return res.status(200).send(items_response);
  });
}

debug("Exporting method getUsers");
/**
 * Function to get all users from the current session. session_id is passed to
 * helper function fetchBillUsers(). The response is returned to the
 * client.
 * @param {request} req used to fetch data from the client. session_id is
 * fetched from req.body.session_id.
 * @param {response} res used to send responses back to the client.
 * @param {object} next
 * @return HTTP status 200 using res.status. Users_response is returned as JSON,
 * containing details about all users in the session
 */
module.exports.getUsers = function(req, res, next) {
  var b_id = req.body.session_id;
  billHelper.fetchBillUsers(b_id).then(function (users_response) {
    debug("fetchBillUsers returns:");
    debug(users_response);
    return res.status(200).send(users_response);
  });
}

debug("Exporting method getOwner");
/**
 * Function to get and return the details of the owner of the bill, the user
 * who created the session. Helper function fetchBillOwner() is used to query
 * the DB.
 * @param {request} req used to fetch data from the client. session_id is
 * fetched from req.body.session_id.
 * @param {response} res used to send responses back to the client.
 * @param {object} next
 * @return HTTP response 200 is sent using res.status(). A JSON is returned to
 * the client containing the details of the bill owner.
 */
module.exports.getOwner = function(req, res, next) {
  var b_id = req.body.session_id;
  billHelper.fetchBillOwner(b_id).then(function (owner_response) {
    debug("fetchBillOwner returns:");
    debug(owner_response);
    return res.status(200).send(owner_response);
  });
}

debug("Exporting method validateSessionData");
/**
 * Function used to validate session data. Calls helper function
 * validateSessionData() to return true or false.
 * @param {request} req used to fetch data from the client. session_id is
 * fetched from req.body.session_id.
 * @param {response} res used to send responses back to the client.
 * @param {object} next
 * @return Boolean object returned to the client.
 */
module.exports.validateSessionData = function(req, res, next) {
  var session = req.body.session_id;
  var user = req.body.user_id;
  billHelper.validateSessionData(session, user).then(function(valid_response) {
    return valid_response;
  });
}

debug("Exporting method leaveSession");
module.exports.leaveSession = function (req, res, next) {
  debug("Leave Session called");
  var session = req.body.session_id;

  var session = req.body.session_id;
  var user = req.body.user_id;
  var query = Bills.find({
    bill_id: session
  });

  debug("Calling DB helper removeUserFromDB")
  billHelper.removeUserFromDB(user, session).then(function(isRemoved) {
    debug("User removed: " + isRemoved);
    return res.status(200).send(isRemoved);
  });
  //isDorment();
}

debug("Exporting method isDorment");
module.exports.isDorment = function (req, res, next) {
  debug("isDorment called");
  var session = body.req.session_id;
  billHelper.isSessionEmpty(session).then(terminateSession(req, res, next));
  debug('Sending response (status: 200)');
  res.status(200).send("Success");
}

debug("Exporting method fetchUserClaims");
module.exports.fetchUserClaims = function(req, res, next) {
  var user_id = req.body.u_id;
  billHelper.fetchUserClaims(user_id).then(function(claims_response) {
    return res.status(200).send(claims_response);
  });
}
