var assert          = require('assert');
var bcrypt          = require('bcryptjs');
var debug           = require('debug')('platypus-api:e2e:auth');
var request         = require('supertest');
var User            = require('../../models/users');

module.exports.test = function(app){
  describe('auth =>', function() {
    describe('GET /auth/check =>', function() {
      //it('should do what?', function(done) {

      //});

      //it('should do this too', function(done) {
        // agent
        //   .get('/auth/check')
        //   .type('form')
        //   .set('Accept', 'application/json')
        //   .expect('Content-Type', /json/)
        //   .expect(200)
        //   .end(function(err, res) {
        //     if (err) return done(err);
        //     done();
        //   });
      //});
    })
  });
};
