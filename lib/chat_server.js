function createChat (server) {
  var io = require('socket.io')(server);
  var guestNumber = 0;
  var nicknames = {};

  io.on('connection', function (socket) {
    guestNumber += 1;
    var guestName = "Guest_" + guestNumber;
    socket.emit('changeNickname', {
        status: "approved",
        nickname: guestName
      }
    );
    
    io.emit('message', {
      message: guestName + " has entered." 
    });
    
    
    socket.on('message', function (data) {
      var user = nicknames[socket.id] || guestName;
      io.emit('message', {
        message: data.message,
        user: user
      });
    });
    
    socket.on('changeNickname', function (data){
      if (checkNicknames(data.nickname)) {
        data.status = 'approved';
        data.message = 'You have changed your nickname to ' + data.nickname;
        socket.emit('changeNickname', data);
        // socket.emit('message', { message: })
        nicknames[socket.id] = data.nickname;
      } else {
        socket.emit('changeNickname', {
          message: 'DENIED!'
        });
      }
    });
  });
  
  io.on('disconnection', function(socket) {
    
    socket.on('message', function (data) {
      io.emit('message', { message: nicknames[socket.id] + " has left."});
      delete nicknames.socket.id;
    });
  });
  
  function checkNicknames(nickname){
    if (nickname.slice(0, 6) === "Guest_") {
      return false;
    } else if (nicknames[nickname]) {
      for (var key in nicknames) {
        if (nicknames.hasOwnProperty(key)) {
          if (nicknames[key] === nickname) {
            return false;
          }
        }
      }
    }
    
    return true;
  };
}

module.exports = createChat;