/**
 * @file This file implements the unit tests that are executed using 'npm test'
 * and also run on Travis.
 */

var assert = require('assert');
var request = require('supertest');

/**
 * This function implements the unit tests that are run with 'npm test' as well
 * as what's built and tested on Travis.
 * @return {[type]} Test will pass or fail.
 */
module.exports.test = function(){
  describe('session creation =>', function() {
    describe('POST /mobile/createSession =>', function() {
      var agent = request.agent(app);
      it('Create session test', function(done) {
        agent
          .post('/mobile/createSession')
          .send({
            username: 'testuser',
            color: 'RGB(255,255,255)'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });

          //assert.equals(response.data.attributes.session_id, "")
      });
    });
  });

  describe('session joining =>', function() {
    describe('POST /mobile/joinSession =>', function() {
      var agent = request.agent(app);
      it('Join session test', function(done) {
        agent
          .post('/mobile/joinSession')
          .send({
            session_id: 'xxxxx',
            username: 'testuser',
            color: 'RGB(255,255,255)'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
          done();
          //assert.equals(response.data.attributes.session_id, "")
      });
    });
  });

  describe('getAllSessionData =>', function(){
    describe('POST /mobile/getAllSessionData =>', function() {
      var agent = request.agent(app);
      it('Getting All Session Data test', function(done){
        agent
          .post('/mobile/getAllSessionData')
          .send({
            session_id: 'xxxxx'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(200)
          .expect(404)
          .end(function(err, res){
            if(err) return done(err);
            done();
          });
          done();
      });
    });
  });

  describe('getItems =>', function(){
    describe('POST /mobile/getItems =>', function (){
      var agent = request.agent(app);
      it('Getting Items', function(done){
        agent
          .post('/mobile/getItems')
          .send({
            session_id: 'xxxxx'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(404)
          .expect(200)
          .end(function(err, res){
            if(err) return done(err);
            done();
          });
          done();
      });
    });
  });

  describe('getUsers =>', function(){
    describe('POST /mobile/getUsers =>', function (){
      var agent = request.agent(app);
      it('Getting Users', function(done){
        agent
          .post('/mobile/getUsers')
          .send({
            session_id: 'xxxxx'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(404)
          .expect(200)
          .end(function(err, res){
            if(err) return done(err);
            done();
          });
          done();
      });
    });
  });

  describe('getUsers =>', function(){
    describe('POST /mobile/getUsers =>', function (){
      var agent = request.agent(app);
      it('Getting Users', function(done){
        agent
          .post('/mobile/getUsers')
          .send({
            session_id: 'xxxxx'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(404)
          .expect(200)
          .end(function(err, res){
            if(err) return done(err);
            done();
          });
          done();
      });
    });
  });
};

/*
module.exports.test = function(){
  describe('session joining =>', function() {
    describe('POST /mobile/joinSession =>', function() {
      var agent = request.agent(app.listen());

      it('Join session test', function(done) {
        agent
          .post('/mobile/joinSession')
          .send({
            session_id: 'xxxxx',
            username: 'testuser',
            color: 'RGB(255,255,255)'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            done();
          });
          //assert.equals(response.data.attributes.session_id, "")
      });
    });
  });
};
*/
/*
module.exports.test = function() {
  describe('sesion terminating =>', function(){
    describe('POST /mobile/terminateSession =>', function() {
      var agent = request.agent(app.listen());

      it('Terminate Session Test', function(done) {
        agent
          .post('/mobile/terminateSession')
          .send({
            session_id: 'xxxxx'
          })
          .type('form')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            done();
          });
          //assert.equals(response.data.attributes.session_id, "");
      });
    });
  });
};
*/
