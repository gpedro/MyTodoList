'use strict';

var Hapi = require('hapi');

var server = new Hapi.Server();

server.connection({
	host: 'localhost',
  port: '8080'
});

server.route({
  method: 'GET',
  path: '/hello',
  handler: function(request, reply) {
    return reply('hello word!');
  }
});

server.start(function(err) {
  if (err) {
    throw err;
  }

  console.log('The server is running: ' + server.info.uri);
});
