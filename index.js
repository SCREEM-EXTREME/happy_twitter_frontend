var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
  host: '0.0.0.0', //the same as localhost
  port: process.env.PORT || 3000, //env.PORT is and environment variable prepared by Heroku Deployment
  routes: { 
    cors: true // cross origin resource sharing 
  }
});

var plugins = [ 
  { register: require('./routes/users.js') },
  { register: require('./routes/sessions.js') },
  { register: require('hapi-mongodb'),
    options: {
      "url": "mongodb://127.0.0.1:27017/happy-twitter",
      "settings" : {
        "db": {
          "native_parser": false
        } 
      }
    }
  },
  {
    register: require('yar'),
    options: {
      cookieOptions: {
        password: 'password',
        isSecure: false // you can use it without HTTPS
      }
    }
  }
];  

server.register(plugins, function(err) {
  if (err) {throw err;}

  server.start(function(){
    console.log('info', 'Server running at: ' + server.info.uri);
  });
});

