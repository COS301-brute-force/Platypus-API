var assert = require('assert');
var request = require('supertest');

module.exports.test = function(){
  describe('session creation =>', function() {
    describe('POST /mobile/createSession =>', function() {
      var agent = request.agent(app.listen());

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
          done();
          //assert.equals(response.data.attributes.session_id, "")
      });
    });
  });

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
