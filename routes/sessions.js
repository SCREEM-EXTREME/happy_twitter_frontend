var Bcrypt = require('bcrypt');

exports.register = function(server, options, next) {

  server.route([
    {
      // Creating a new session / logging in
      method: 'POST',
      path: '/sessions',
      handler: function(request, reply) {
        // load the mongoDB
        var db = request.server.plugins['hapi-mongodb'].db;

        // Read the payload
        var user = request.payload.user;

        // Find if the user exists
        db.collection('users').findOne({ "username": user.username }, function(err, userMongo) {
          if (err) { return reply('Internal MongoDB error', err); }

          if (userMongo === null) {
            return reply({ "message": "User doesn't exist" });
          }

          Bcrypt.compare(user.password, userMongo.password, function(err, matched) {
            if (matched) {
              // If password matches, please authenticate user and add to cookie
              function randomKeyGenerator() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
              }
   
              // Generate a random string
              var randomKey = randomKeyGenerator();

              var newSession = {
                "session_id": randomKey,
                "user_id": userMongo._id
              };

              db.collection('sessions').insert(newSession, function(err, writeResult) {
                if (err) { return reply('Internal MongoDB error', err); }

                // Store the Session information in the browser Cookie
                // using Yar
                request.session.set('hapi_twitter_session', {
                  "session_key": randomKey,
                  "user_id": userMongo._id
                });

                return reply(writeResult);
              });

            } else {
              reply({ "message": "Not authorized" });
            }
          });


        });
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'sessions-routes',
  version: '0.0.1'
};