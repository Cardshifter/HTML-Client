CardshifterApp.controller("LobbyController", function($scope, $interval, $timeout) {
    var CHAT_FEED_LIMIT = 10;
    var POLL_FREQ = 2000;
    var MESSAGE_DELAY = 3000;
    var ENTER_KEY = 13;

    $scope.users = [];
    $scope.chatMessages = [];

    var getUsersMessage = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
    CardshifterServerAPI.sendMessage(getUsersMessage);

    $interval(function() { // update chat and users
        while(message = CardshifterServerAPI.getMessage()) {
            switch(message.command) {
                case "userstatus":
                    // do conditional checking if user is offline
                    if(message.status === "OFFLINE") {
                        for(var i = 0, length = $scope.users.length; i < length; i++) {
                            // if the user described in the message is the user in this iteration
                            if($scope.users[i].name === message.name) {
                                $scope.users.splice(i, 1); // remove that user from the array
                            }
                        }
                    } else {
                        $scope.users.push(message);
                    }

                    break;
                case "chat":
                    if($scope.chatMessages.length === CHAT_FEED_LIMIT) {
                        // remove the latest (opposite of earliest) chat message
                        $scope.chatMessages.shift();
                    }

                    var now = new Date();
                    var YMD = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
                    var HMS = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
                    message.timestamp = YMD + " " + HMS;

                    $scope.chatMessages.push(message);
                    break;
            }
        }
    }, POLL_FREQ);

    $scope.sendMessage = function(e) {
        if(e && e.keyCode !== ENTER_KEY) { // user may hit "enter" key
            return;
        }

        $scope.sending = true;
        var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage($scope.user_chat_message);
        CardshifterServerAPI.sendMessage(chatMessage);

        $scope.user_chat_message = ""; // clear the input box
        $timeout(function() { // allow another message to be sent in 3 seconds
            $scope.sending = false;
        }, MESSAGE_DELAY);
    }
});