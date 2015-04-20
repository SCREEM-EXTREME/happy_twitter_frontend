// routes/auth.js
module.exports = {};

module.exports.authenticated = function(request, callback) {
  var session = request.session.get('hapi_twitter_session');
  var db = request.server.plugins['hapi-mongodb'].db;

  if (!session) {
    return callback({ "authenticated": false, "message": "Unauthorized" });
  }

  db.collection('sessions').findOne({ "session_id": session.session_id }, function(err, result) {
    if (result === null) {
      return callback({ 
        "authenticated": false,
        "message": "Unauthorized. Session exists on browser."
      });
    } else {
      return callback({ 
        "authenticated": true,
        "message": "Authorized. Session exists on browser."
      });
    }
  });
};