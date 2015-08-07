CardshifterApp.controller("LobbyController", function($scope, $interval, $timeout) {
    var CHAT_FEED_LIMIT = 10;
    var POLL_FREQ = 2000;
    var MESSAGE_DELAY = 3000;
    var ENTER_KEY = 13;

    $scope.users = [];
    $scope.chatMessages = [];
    $scope.mods = [];
    $scope.currentUser = window.currentUser;
    $scope.invite = {
        id: null,
        name: null,
        type: null
    };
    $scope.gotInvite = false;

    var getUsersMessage = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
    CardshifterServerAPI.sendMessage(getUsersMessage); // get all online users

    $interval(function() { // update chat and users
        while(message = CardshifterServerAPI.getMessage()) {
            switch(message.command) {
                case "userstatus":
                    // do conditional checking if user is offline
                    if(message.status === "OFFLINE") {
                        for(var i = 0, length = $scope.users.length; i < length; i++) {

                            if($scope.users[i].userId === message.userId) {
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

                case "inviteRequest":
                    console.log("got invite");
                    $scope.invite.id = message.id;
                    $scope.invite.name = message.name;
                    $scope.invite.type = message.gameType;
                    $scope.gotInvite = true;

                    break;
                case "availableMods":
                    $scope.mods = message.mods;
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

    $scope.startGame = function() {
        if($scope.selected_mod && $scope.selected_opponent) {
            var startGameMessage = new CardshifterServerAPI.messageTypes.StartGameRequest($scope.selected_opponent,
                                                                                          $scope.selected_mod);
            CardshifterServerAPI.sendMessage(startGameMessage, function(returnMessage) {
                if(returnMessage.command !== "wait") {
                    console.log("server didn't like that")
                }
            });
        } else {
            // user needs to choose an opponent and/or a mod
            console.log("need to choose mod and/or opponent");
        }
    }

    $scope.acceptInvite = function(accept) {

        var inviteResponse = new CardshifterServerAPI.messageTypes.InviteResponse($scope.invite.id, accept);
        CardshifterServerAPI.sendMessage(inviteResponse);
        $scope.gotInvite = false;

        if(accept) {
            // switch to game page
        }
    }
});