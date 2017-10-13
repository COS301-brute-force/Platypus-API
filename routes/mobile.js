/**
 * @file Defines the routes used by the mobile application for communiction
 * with the API
 */
var debug     = require('debug')('platypus-api:routes:mobile');
var express   = require('express');
var mobile    = require('../controllers/mobile');


var router = express.Router();
/**
 * Define route for the createSession function.
 */
router.post('/createSession', mobile.createSession);

/**
 * Define Route for the joinSession function.
 */
router.post('/joinSession', mobile.joinSession);

/**
 * Define Route for the sendImage function.
 */
router.post('/sendImage', mobile.sendImage);

/**
 * Define route for the getAllSessionData function.
 */
router.post('/getAllSessionData', mobile.getAllSessionData);


router.post('/leaveSession', mobile.leaveSession);

//router.post('/isDorment', mobile.isDorment);

/**
 * Define route for the getItems function.
 */
router.post('/getItems', mobile.getItems);

/**
 * Define route for the getUsers function.
 */
router.post('/getUsers', mobile.getUsers);

/**
 * Define route for the getOwner function.
 */
router.post('/getOwner', mobile.getOwner);

/**
 * Define route for the validateSessionData function.
 */
router.post('/validateSessionData', mobile.validateSessionData);

debug('Mobile router exported');
module.exports = router;
