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

var welcome = function (socket, io) {
  guestNumber += 1;
  var guestName = "Guest_" + guestNumber;
  nicknames[socket.id] = guestName;
  io.to("Lobby").emit('message', {
    sender: "* Server *",
    message: nicknames[socket.id] + " has joined Lobby."
  });

  socket.join('Lobby');
  userList.push(guestName);
  currentRooms[socket.id] = "Lobby";

  var welcomeMessage = "Welcome to the ChatApp server!";
  socket.emit('message', {
    message: welcomeMessage,
    sender: "* Server *"
  });

  var lobby = "Lobby";

  socket.emit('message', {
    message: "Now joining " + lobby,
    sender: "* Server *"
  });

  socket.emit('message', {
    message: "Your nickname is " + guestName,
    sender: "* Server *"
  });
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
    sender: "* Server *",
    message: nicknames[socket.id] + " has joined " + room + "."
  });

};

var handleNameChangeRequests = function (socket, io) {
  room = currentRooms[socket.id];
  socket.on('changeNickname', function (data){
    if (checkNicknames(data.nickname)) {
      data.status = 'approved';
      data.message = nicknames[socket.id] + ' has changed nickname to ' + data.nickname;
      data.sender = "* Server *";
      changeNickname(nicknames[socket.id], data.nickname);
      io.to(currentRooms[socket.id]).emit('message', data);
      nicknames[socket.id] = data.nickname;
      io.to(currentRooms[socket.id]).emit('updateUserlist', { users: getNicknames() });
    } else {
      socket.emit('message', {
        message: 'Names cannot begin with "Guest"',
        sender: "* Server *"
      });
    }
  });
};

var checkNicknames = function (nickname){
  if (nickname.slice(0, 6) === "Guest_") {
    return false;
  } else if (nickname.slice(0, 9) === "* Server *") {
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
      sender: "* Server *"
    });

    io.to(oldRoom).emit('message', {
      message: (nicknames[socket.id] + " has left " + oldRoom + "."),
      sender: "* Server *"
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
      sender: "* Server *"
    });

    delete nicknames[socket.id];
    delete currentRooms[socket.id];

    io.sockets.emit('roomList', { users: getRoomData(io)});
  });
};

var getRoomData = function (io) {
  var roomHash = io.sockets.adapter.rooms;
  var roomData = {};
  for(var room in roomHash) {
    // dont include default rooms of sockets with themselves
    if(io.sockets.connected[room]) { continue; }
    roomData[room] = [];
    for(var socket in roomHash[room]) {
      roomData[room].push(nicknames[socket]);
    }
  }

  console.log(roomData);
  return roomData;
};

var handleInvalidCommand = function (socket, io) {
  socket.on('invalidCommand', function() {
      socket.emit("message", {
        message: "Invalid Command",
        sender: "* Server *"
      });
  });
};

module.exports = createChat;
