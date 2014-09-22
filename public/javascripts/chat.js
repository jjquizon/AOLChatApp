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
})();