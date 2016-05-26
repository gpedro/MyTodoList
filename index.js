'use strict';

var Hapi = require('hapi');
var Inert = require('inert');
var Path = require('path');

// var server = new Hapi.Server(~~process.env.PORT || 3000, '0.0.0.0');

var server = new Hapi.Server({
  connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
  }
);

server.connection({
  port: process.env.PORT || 5000
})

server.register(Inert, function(err) {

  if (err) {
    throw err;
  }

});

server.route([
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
          path: '.',
          redirectToSlash: true,
          index: true
      }
    }
  },
  {
    method: 'GET',
    path: '/',
    handler: {
      file: 'index.html'
    }

  }
]);

server.start(function(err) {
  if (err) {
    throw err;
  }

  console.log('The server is running: ' + server.info.uri);
});
