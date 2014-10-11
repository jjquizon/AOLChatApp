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
    } else if (input === ""){
      ChatApp.displayMessages({

      });
    } else {
      chat.sendMessage(input);
    }
  };

  ChatApp.displayMessages = function (data) {
    $('.messages').append('<li>' + data.sender + ": "+ data.message + '</li>');
  };

  ChatApp.refresh = function () {
    data = ChatApp.currentData();
    ChatApp.displayUserlist(data);
    ChatApp.displayChatTabs(data);
  };

  ChatApp.displayUserlist = function (data) {
    $userlist = $('.userlist');
    $chatroom = $('#chatroom-title');
    $chatroom.empty();
    $userlist.empty();
    roomsHash = data.users;
    for(var room in roomsHash) {
      if (roomsHash[room].length > 0) {
        var appending = '<strong>' + room + ' (' + roomsHash[room].length + ')</strong>';
        $chatroom.append(appending);
        roomsHash[room].forEach(function (user) {
          var user_append = '<li>' + user + '</li>';
          $userlist.append(user_append);
        });
      }
    }
  };

  ChatApp.displayChatTabs = function (data) {
    var appending;
    var numOfRooms = 0;
    var roomsHash = data.users;
    $chatTabList = $("#chat-tabs-list");
    $chatTabList.empty();

    for(var room in roomsHash) {
      if (roomsHash[room].indexOf(ChatApp.currentUser()) !== -1){
        numOfRooms += 1;
        appending = "<li id=" + room + "><a class='chat-tab'>" + room + "</a></li>";
        $chatTabList.append(appending);
      }
    }

    if (numOfRooms == 1) {
      ChatApp.setActiveTab("Lobby");
    }
  };

  ChatApp.currentData = function (data) {
    if (data) {
      this._currentData = data;
    }

    return this._currentData;
  };

  ChatApp.setActiveTab = function (tab) {
    if (tab) {
      this._activeTab = tab;
    }
    var tabId = "#" + tab;
    $(document).find(tabId).addClass('active');
  };

  $(document).ready(function (){
    $('form').on("submit", ChatApp.sendMessages);

    socket.on("message", function (data) {
      ChatApp.displayMessages(data);
    });

    socket.on("changeNickname", function (data) {
      ChatApp.displayMessages(data);
    });

    socket.on('roomList', function (data) {
      ChatApp.currentData(data);
      ChatApp.refresh();
    });

    socket.on('disconnect', function (socket) {
      socket: socket
    });

    socket.on('currentName', function (data) {
      ChatApp.currentUser(data);
    });

    $(".chat-tab").click(function(event){
      event.preventDefault();
    });

    ChatApp.setActiveTab("Lobby");
  });
})();
