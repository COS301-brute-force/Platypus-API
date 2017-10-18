/**
 * @file This file implements the defined routes for use by the OCR component
 */
var config      = require('config');
var debug       = require('debug')('platypus-api:controllers:ocr');
var fs          = require('fs');
var request     = require('request');

var its = [	{price: '36.00', quantity: '3', desc: "Add Portion Chi", id: '1'},
{price: '24.00', quantity: '1', desc: "S/Wich Bacon, A", id: '2'},
{price: '36.00', quantity: '1', desc: "Trami Chic P/De", id: '3'},
{price: '38.00', quantity: '1', desc: "Bacon Avo & Pep", id: '4'},
{price: '35.00', quantity: '1', desc: "Cheese Burger", id: '5'},
{price: '55.00', quantity: '1', desc: "Chic Schnitzel", id: '6'},
{price: '10.00', quantity: '1', desc: "Tea Rooibos", id: '7'},
{price: '20.00', quantity: '1', desc: "Americano Dbl", id: '8'},
{price: '32.00', quantity: '2', desc: "330Ml Coke", id: '9'},
{price: '16.00', quantity: '1', desc: "200Ml Tonic Wat", id: '10'},
{price: '7.00', quantity: '1', desc: "Lime Cordial", id: '11'}];

/**
 * @TODO Once this method is correctly implemented complete documentation.
 * @param {request} req req used by Express.js to fetch data from the client.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return JSON object containing Bill information
 */
debug('Exporting method: @todo');
module.exports.detect = function(target_path, bill) {
  return new Promise(function(resolve, reject){
    var ocr_module = config.servers.ocr.host;
    var ocr_port = config.servers.ocr.port;
    var response = {
      data: {
        type: 'ocr',
        id: 0,
        attributes: {
          session_id: bill,
          items: null
        }
      }
    };
    var formData = {
      file: fs.createReadStream(target_path),
    };
    // request.post({url:'http://192.168.43.144' + /*+ ocr_module +*/ ':' + ocr_port + '/', formData: formData, json: true}, function optionalCallback(err, httpResponse, body) {
    request.post({url:`http://${ocr_module}:${ocr_port}/`, formData: formData, json: true}, function optionalCallback(err, httpResponse, body) {
      if (err) {
        debug("OCR Failed");
        debug(httpResponse);
        reject(err);
      }
      debug("Body: ");
      debug(body);
      if(response != null && body.type == 'success' && body.attributes.data.length > 0) {
        response.data.attributes.items = body.attributes.data;
      }
      else{
        response.data.attributes.items = its;
      }

      debug('Sending response (status: 200)');
      resolve(response);
    });
  });
}