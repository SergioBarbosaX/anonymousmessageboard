/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai     = require('chai');
var assert   = chai.assert;
var ObjectID = require('mongodb').ObjectID;
var server   = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var threadInsertedId;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('Create a new thread', function(done) {
       chai.request(server)
        .post('/api/threads/boardtest')
        .send( {
          text:     'text for the new thread', 
          delete_password: 'pass'
        } )
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      test('Get most recent 10 bumped threads with only the most recent 3 replies each', function(done) {
       chai.request(server)
        .get('/api/threads/boardtest')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 10);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replies');
          assert.isArray(res.body[0].replies);
          assert.property(res.body[0], 'replycount');
          
          threadInsertedId = res.body[0]._id;
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('Not delete a thread due to an incorrect value', function(done) {
       chai.request(server)
        .delete('/api/threads/boardtest')
        .send({thread_id: threadInsertedId, delete_password: 'passw'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('Delete a thread completely', function(done) {
       chai.request(server)
        .delete('/api/threads/boardtest')
        .send({thread_id: threadInsertedId.toString(), delete_password: 'pass'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      test('Report a thread and change its reported value to true', function(done) {
       chai.request(server)
        .put('/api/threads/boardtest')
        .send({report_id: '5e41ba27f834b10b7d767aeb'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Create a new reply', function(done) {
       chai.request(server)
        .post('/api/replies/boardtest')
        .send( {
          text:            'text for the new thread', 
          delete_password: 'pass',
          thread_id:       '5e41ba27f834b10b7d767aeb'
        } )
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
                 
    });
    
    suite('GET', function() {
      test('Get entire thread with all its replies', function(done) {
       chai.request(server)
        .get('/api/replies/boardtest')
        .query({thread_id: '5e41ba17f3ac3a0b43686dc4' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.property(res.body, 'text');
          assert.property(res.body, 'createdon_');
          assert.property(res.body, 'bumpedon_');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      test('Report a reply and change its reported value to true', function(done) {
       chai.request(server)
        .put('/api/replies/boardtest')
        .send({thread_id: '5e41ba27f834b10b7d767aeb', reply_id: '5e41ba28f834b10b7d767aec'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('Not delete a post due to an incorrect value', function(done) {
       chai.request(server)
        .delete('/api/replies/boardtest')
        .send({thread_id: '5e41ba27f834b10b7d767aeb', reply_id: '5e41ba28f834b10b7d767aec', delete_password: 'passw'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('Delete a post', function(done) {
       chai.request(server)
        .delete('/api/replies/boardtest')
        .send({thread_id: '5e41ba27f834b10b7d767aeb', reply_id: '5e41ba28f834b10b7d767aec', delete_password: 'pass'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    }); 
    
  });

});
