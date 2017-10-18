var debug     = require('debug')('platypus-api:routes');
var express   = require('express');
var mobile    = require('./mobile');
var ocr       = require('./ocr');

var router = express.Router();

debug('Adding routes');

router.use('/mobile', mobile);
router.use('/ocr', ocr);

debug('Main router exported');
module.exports = router;
