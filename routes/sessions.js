var Bcrypt = require('bcrypt');
var Joi = require('joi');
var Auth = require('./auth');

exports.register = function(server,options,next){

    server.route([ 
        {
        method: 'POST',
        path: '/sessions',
        config: {
            handler: function(request, reply){
              var db       = request.server.plugins['hapi-mongodb'].db;
              var userLogin = request.payload.user;

              db.collection('users').findOne({"username":userLogin.username},function(err,userMongo){
                  if (err) {return reply('Internal Mongo error',err);}

                  if (userMongo === null){
                      return reply ({"message":"User doesn't exist"});
                  }

                  Bcrypt.compare(userLogin.password,userMongo.password, function(err,match){
                      if (match){
                          function randomKeyGenerator() {
                                return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
                              }
   
                          // Generate a random key
                              var randomKey = (randomKeyGenerator() + randomKeyGenerator() + "-" + randomKeyGenerator() + "-4" + randomKeyGenerator().substr(0,3) + "-" + randomKeyGenerator() + "-" + randomKeyGenerator() + randomKeyGenerator() + randomKeyGenerator()).toLowerCase();

                              var newSession = {
                                  "session_id":randomKey,
                                  "user_id":userMongo._id
                              };

                              db.collection('sessions').insert(newSession,function(err,writeResult){
                                  if (err) {return reply('Internal Mongo error',err);}
                                  //Yar
                                  request.session.set("hapi_twitter_session",{
                                      "session_id":randomKey,
                                      "user_id":userMongo._id
                                  });

                                  return reply(writeResult);
                              });

                      }else{
                          reply({"message":"Not Authorised"})
                      }
                  });
              });
            }
        }
      },
      {
          method: "GET",
          path: "/authenticated",
          handler: function(request,reply){
              Auth.authenticated(request,function(result){
                  reply(result);
              });
          }
      },
      {
          method: "DELETE",
          path: "/sessions",
          handler: function(request,reply){
              var session = request.session.get("hapi_twitter_session");
              var db = request.server.plugins['hapi-mongodb'].db;

              if(!session){
                  return reply({'message':'Already logged out'})
                  //return will terminate the test of program
              }

              db.collection('sessions').remove({'session_id':session.session_key}, function(err, writeResult){
                  if (err) {return reply('Internal Mongo error',err);}
                  return reply(writeResult);
              });
          }
      }
    ]);
    
    
  next();
};


exports.register.attributes = {
    name: 'sessions-routes',
    version: '0.0.1'
}