function createChat (server) {
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {
    socket.on('message', function (data) {
      io.emit('message', data);
    });
  });
}

module.exports = createChat;