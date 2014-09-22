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
    chat.sendMessage(ChatApp.getMessages());
  };

  ChatApp.displayMessages = function (data) {
    $('.messages').prepend('<li>' + data.message + '</li>');
  };

  $(document).ready(function (){
    $('form').on("submit", ChatApp.sendMessages);
    socket.on("message", function (data) {
      ChatApp.displayMessages(data);
    });  
  });
})();