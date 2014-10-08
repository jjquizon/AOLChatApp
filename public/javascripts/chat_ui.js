(function(){
  if(typeof ChatApp === "undefined"){
    window.ChatApp = {};
  }

  var socket = io('http://localhost');

  var chat = new ChatApp.Chat(socket);

  ChatApp.getMessages = function () {
    var $input = $('input');
    var inputText = $input.val();
    $input.val('');
    return inputText;
  };

  ChatApp.sendMessages = function (event) {
    event.preventDefault();
    var input = ChatApp.getMessages();
    if (input.slice(0, 1) === "/") {
      ChatApp.processCommand(socket, input);
    } else {
      chat.sendMessage(input);
    }
  };

  ChatApp.displayMessages = function (data) {
    $('.messages').append('<li>' + data.sender + ": "+ data.message + '</li>');
  };

  ChatApp.displayUserlist = function (data) {
    $('.userlist').empty();
    
  };

  $(document).ready(function (){
    $('form').on("submit", ChatApp.sendMessages);

    socket.on("message", function (data) {
      ChatApp.displayMessages(data);
    });

    socket.on("changeNickname", function (data) {
      // if (data.status === "approved") {
      //   ChatApp.displayMessages(data);
      // } else {
      //   ChatApp.displayMessages(data);
      // }
      ChatApp.displayMessages(data);
    });

    socket.on('roomList', function (data) {
      ChatApp.displayUserlist(data);
    });

    socket.on('disconnect', function (socket) {
      socket: socket
    });


  });
})();
