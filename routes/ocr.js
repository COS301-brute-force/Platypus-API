/**
 * @file This defines the routes to be used by the OCR component.
 */
var debug     = require('debug')('platypus-api:routes:ocr');
var express   = require('express');
var ocr       = require('../controllers/ocr');

var router = express.Router();

debug('Adding route: POST /');

/**
 * Define Route for the detect function.
 */
router.post('/detect', ocr.detect);

debug('Tests router exported');
module.exports = router;
