var guestNumber = 0;
var nicknames = {};
var userList = [];
var currentRooms = {};


function createChat (server) {
  io = require('socket.io')(server);
  io.sockets.on('connection', function (socket) {
    welcome(socket, io);
    handleMessages(socket, io);
    handleNameChangeRequests(socket, io);
    handleRoomChangeRequests(socket, io);
    handleDisconnection(socket, io);
    handleInvalidCommand(socket, io);
    io.sockets.emit('roomList', { users: getRoomData(io)});
  });
}

var sendSocketId = function(socket, io) {
  socket.emit('socketInfo', {
    socketId: socket.id
  });
};

var welcome = function (socket, io) {
  guestNumber += 1;
  var guestName = "Guest_" + guestNumber;
  nicknames[socket.id] = guestName;
  io.to("Lobby").emit('message', {
    sender: "Onlinehost",
    message: nicknames[socket.id] + " has joined Lobby."
  });

  socket.join('Lobby');
  userList.push(guestName);
  currentRooms[socket.id] = "Lobby";
  messages = ["Welcome to the Chatapp Server",
    "Now joining Lobby",
    "Your nickname is " + guestName,
    "To change your name, type '/nick [new nickname]'"
  ];

  messages.forEach(function (message) {
    socket.emit('message', {
      message: message,
      sender: "Onlinehost"
    });
  });

  sendCurrentName(socket);
};

var handleMessages = function (socket, io) {
  socket.on('message', function (data) {
    var user = nicknames[socket.id];
    var message = data.message;
    io.to(currentRooms[socket.id]).emit('message', {
      message: message,
      sender: user
    });
  });
};

var joinRoom = function (socket, io, room) {
  socket.join(room);
  currentRooms[socket.id] = room;

  io.to(room).emit('message', {
    sender: "Onlinehost",
    message: nicknames[socket.id] + " has joined " + room + "."
  });

};

var handleNameChangeRequests = function (socket, io) {
  room = currentRooms[socket.id];
  socket.on('changeNickname', function (data){
    if (checkNicknames(data.nickname)) {
      data.status = 'approved';
      data.message = nicknames[socket.id] + ' has changed nickname to ' + data.nickname;
      data.sender = "Onlinehost";
      io.to(currentRooms[socket.id]).emit('message', data);
      nicknames[socket.id] = data.nickname;
      sendCurrentName(socket);
      io.sockets.emit('roomList', { users: getRoomData(io)});
    } else {
      socket.emit('message', {
        message: 'Names cannot begin with "Guest"',
        sender: "Onlinehost"
      });
    }
  });
};

var checkNicknames = function (nickname){
  if (nickname.slice(0, 6) === "Guest_") {
    return false;
  } else if (nickname.slice(0, 9) === "Onlinehost") {
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

var handleRoomChangeRequests = function (socket, io) {
  socket.on('changeRoomRequest', function (data) {
    var oldRoom = currentRooms[socket.id];
    newRoom = data.room;
    socket.leave(oldRoom);
    joinRoom(socket, io, newRoom);
    socket.emit('message', {
      message: "Now joining " + newRoom,
      sender: "Onlinehost"
    });

    io.to(oldRoom).emit('message', {
      message: (nicknames[socket.id] + " has left " + oldRoom + "."),
      sender: "Onlinehost"
    });


    io.sockets.emit('roomList', { users: getRoomData(io)});
  });
};

var handleDisconnection = function (socket, io){

  socket.on("disconnect", function () {
    var nameIndex = userList.indexOf(nicknames[socket.id]);
    delete userList[nameIndex];
    var leavingRoom = currentRooms[socket.id];

    io.to(leavingRoom).emit('message', {
      message: (nicknames[socket.id] + " has left " + leavingRoom + "."),
      sender: "Onlinehost"
    });

    delete nicknames[socket.id];
    delete currentRooms[socket.id];

    io.sockets.emit('roomList', { users: getRoomData(io)});
  });
};

var getRoomData = function (io) {
  var roomHash = io.sockets.adapter.rooms;
  var rooms = Object.getOwnPropertyNames(roomHash);
  // rooms.forEach(function(room){
  //   console.log(room);
  //   console.log(roomHash[room].length);
  //   if (roomHash[room].length === 0){
  //     // delete roomHash[room];
  //     console.log(roomHash);
  //   }
  // });

  var roomData = {};
  for(var room in roomHash) {
    // dont include default rooms of sockets with themselves
    if(io.sockets.connected[room]) { continue; }
    roomData[room] = [];
    for(var socket in roomHash[room]) {
      roomData[room].push(nicknames[socket]);
    }

    if (roomData[room].length === 0) {
      delete roomHash[room];
    }
  }

  return roomData;
};

var handleInvalidCommand = function (socket, io) {
  socket.on('invalidCommand', function() {
      socket.emit("message", {
        message: "Invalid Command",
        sender: "Onlinehost"
      });
  });
};

var sendCurrentName = function (socket, io) {
  socket.emit("currentName", {
    currentName: nicknames[socket.id]
  });
};

module.exports = createChat;
