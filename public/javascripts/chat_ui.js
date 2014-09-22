(function(){
  if(typeof ChatApp === "undefined"){
    window.ChatApp = {};
  }
  
  var socket = io('http://localhost');

  var chat = new ChatApp.Chat(socket);

  ChatApp.getMessages = function () {
    // event.preventDefault();
    // return $(event.target).val();
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
    $('.messages').prepend('<li>' + data.message + '</li>');
  };

  $(document).ready(function (){
    $('form').on("submit", ChatApp.sendMessages);
    socket.on("message", function (data) {
      ChatApp.displayMessages(data);
    });  
    
    socket.on("changeNickname", function (data) {
      // if (data.status = "approved") {
//         ChatApp.displayMessages(data);
//       } else {
//         ChatApp.displayMessages(data);
//       }
      ChatApp.displayMessages(data);
    })
  });
})();