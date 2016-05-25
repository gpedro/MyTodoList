'use strict';

var Hapi = require('hapi');

// var server = new Hapi.Server(~~process.env.PORT || 3000, '0.0.0.0');

var server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 5000
})

server.route([
  {
    method: 'GET',
    path: '/',
    config:
      {
        handler: function(request, reply) {
          reply('Sucesso!\n');
        }
      }
    }
]);

/*var server = new Hapi.Server();

server.connection({
  port: '5000'
});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    return reply('hello word!');
  }
});*/

server.start(function(err) {
  if (err) {
    throw err;
  }

  console.log('The server is running: ' + server.info.uri);
});
