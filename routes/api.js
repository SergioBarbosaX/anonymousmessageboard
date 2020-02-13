/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect                    = require('chai').expect;
const MongoClient               = require('mongodb').MongoClient;
const ObjectID                  = require('mongodb').ObjectID;
const MONGODB_CONNECTION_STRING = process.env.DB;

var dbo;

MongoClient.connect(MONGODB_CONNECTION_STRING)
           .then ( db => {
              dbo = db.db( "messageBoard" );
           })
           .catch( err => console.log( err ) );


module.exports = function (app) {
  
  app.route('/api/threads/:board') 
     .post( function( req, res ) {
    
        const newMessage = {
          text:            req.body.text, 
          createdon_:      new Date(),
          bumpedon_:       new Date(),
          reported:        false, 
          deletepassword_: req.body.delete_password,
          replies:         []
        };
    
        let {board} = req.params;
    
        dbo.collection( "messages" ).insertOne( newMessage )
                                    .then( doc => res.redirect(`/b/${board}`) )
                                    .catch( err => console.log( err ) );
    } )
  
    .get( function( req, res ) {
    
      dbo.collection( "messages" ).find( { }, {deletepassword_: 0, reported: 0} ).sort( {bumpedon_: -1} ).limit(10).toArray()
                                  .then( threads => {
                                    let newThreads;
                                    newThreads = threads.map( thread => { 
                                      return thread = { _id: thread._id, text: thread.text, created_on: thread.createdon_, bumped_on: thread.bumpedon_, 
                                               replies: thread.replies.reverse().slice(0, 3),
                                               replycount: thread.replies.length }
                                    }) 
                                    res.json(newThreads);
                                  } )                                                                      
                                  .catch( err => console.log( err ) );
    } )
  
    .delete( function( req, res ) {
      let threadId = ObjectID( req.body.thread_id );
      let password = req.body.delete_password;
    
      dbo.collection( "messages" ).deleteOne( { _id: threadId, deletepassword_: password } )
                                  .then( document => document.deletedCount === 0 ? res.send('incorrect password') : res.send('success') )
                                  .catch( err => console.log( err ) );
    
    } )
  
    .put( function( req, res) {
      let threadId = ObjectID(req.body.report_id);
    
      dbo.collection( "messages" ).findOneAndUpdate( { _id: threadId }, { $set: { reported: true} }, { returnNewDocument: true } )
                                  .then( document => document === null ? res.send( 'no thread reported' ) : res.send( 'success' ) )
                                  .catch( err => console.log( err ) );
    })
          
  app.route('/api/replies/:board')
     .post( function( req, res ) {
        
        let threadId = ObjectID(req.body.thread_id);
        let {board}  = req.params;
    
        const newReply = { 
          _id:             new ObjectID(),
          text:            req.body.text,
          createdon_:      new Date(), 
          deletepassword_: req.body.delete_password, 
          reported:        false
        };
    
        dbo.collection( "messages" ).findOneAndUpdate( { _id: threadId }, { $set: { bumpedon_: new Date() }, $push: { replies: newReply } }, { returnOriginal: false } )
                         .then( message => message.value === null ? res.send( 'no message exists' ) : res.redirect(`/b/${board}/`) )
                         .catch( err => console.log( err ) );
     } )
  
     .get( function( req, res ) {
       let threadId = ObjectID(req.query.thread_id);
    
       dbo.collection( "messages" ).findOne( { _id: threadId }, { 'deletepassword_': 0, 'reported': 0 } )
                                   .then( message => message === null ? res.send( 'no message exists' ) : res.send( message ) )
                                   .catch( err => console.log( err ) );
     } )
  
     .delete( function( req, res ) {
      let threadId       = ObjectID(req.body.thread_id);
      let replyId        = ObjectID(req.body.reply_id);
      let deletePassword = req.body.delete_password;
    
      dbo.collection( "messages" ).findOne( { _id: threadId, replies: { $elemMatch: { deletepassword_: deletePassword } } }, { replies: 1 } )
                                  .then( replies => {
                                    if ( replies === null )
                                      res.send( 'incorrect password' )
                                    else {
                                      dbo.collection( "messages" ).findOneAndUpdate( { _id: threadId }, 
                                                                                     { $set: { 'replies.$[reply].text': 'deleted' } },  
                                                                                     { arrayFilters: [ { 'reply._id': replyId } ] } )
                                         .then( message => message === null ? res.send( 'incorrect password' ) : res.send( 'success' ) )
                                         .catch( err => console.log( err ) );
                                    }
                                  } )
                                  .catch( err => console.log( err ) );
     } )
  
     .put( function( req, res) {
      let threadId = ObjectID(req.body.thread_id);
      let replyId  = ObjectID(req.body.reply_id);
    
      dbo.collection( "messages" ).findOneAndUpdate( { _id: threadId }, { $set: { 'replies.$[element].reported': true} }, { arrayFilters: [ { 'element._id' : replyId  } ] } )
                                  .then( document => document === null ? res.send( 'no reply reported' ) : res.send( 'success' ) )
                                  .catch( err => console.log( err ) );
    })
};
