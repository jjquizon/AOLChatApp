var http = require('http'),
  static = require('node-static'),
  socketio = require('socket.io'),
  createChat = require('./chat_server.js');

var file = new static.Server('./public');


var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

var chat = createChat(server);

server.listen(3000);  
