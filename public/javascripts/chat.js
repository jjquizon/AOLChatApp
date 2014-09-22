(function(){
  if(typeof ChatApp === "undefined"){
    ChatApp = {};
  }
  
  ChatApp.Chat = function (socket) {
    this.socket = socket;
  
    this.sendMessage = function (textData) {
      socket.emit("message", { message: textData });
    };
  };
  
  ChatApp.processCommand = function (socket, command) {
    if (command.slice(0, 5) === "/nick") {
      socket.emit("changeNickname", {
        nickname: command.slice(6)
      });
    } else {
      // raise error
    }
  };
})();