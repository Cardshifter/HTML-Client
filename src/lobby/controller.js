'use strict';

// @ngInject
function LobbyController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    var CHAT_FEED_LIMIT = 10;
    var ENTER_KEY = 13;
    var MESSAGE_DELAY = 3000;

    $scope.users = [];
    $scope.chatMessages = [];
    $scope.mods = window.availableGameMods || [];
    $scope.currentUser = window.currentUser;
    $scope.invite = {
        id: null,
        name: null,
        type: null
    };
    $scope.gotInvite = false;

    var gameMod = ""; // will be set by either startGame or acceptInvite
    var ping = document.getElementById("ping"); // is this angulary?

    var commandMap = {
        "userstatus": updateUserList,
        "chat": addChatMessage,
        "inviteRequest": displayInvite,
        "availableMods": displayMods,
        "newgame": enterNewGame
    };

    var getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
    CardshifterServerAPI.sendMessage(getUsers);

    CardshifterServerAPI.setMessageListener(function(message) {
        $scope.$apply(function() {
            commandMap[message.command](message);
        })
    }, ["userstatus", "chat", "inviteRequest", "availableMods", "newgame"]);

    /**
    * This function is called when the user hits the "Send" button
    * write text to the chat message text box.
    *
    * Upon click the send button or hitting the enter key, this function
    * will send a new ChatMessage to the server. Then, the clear the
    * chat message input box and disable use of the send button
    * for the time specified in MESSAGE_DELAY
    */
    $scope.sendMessage = function(e) {
        if(e && e.keyCode !== ENTER_KEY) { // user may hit "enter" key
            return;
        }
        if($scope.sending) { // enter key bypasses button disable
            return;
        }

        $scope.sending = true;
        var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage($scope.user_chat_message);
        CardshifterServerAPI.sendMessage(chatMessage);

        $scope.user_chat_message = ""; // clear the input box
        $timeout(function() { // allow another message to be sent in 3 seconds
            $scope.sending = false;
        }, MESSAGE_DELAY);
    };

    /**
    * This function is called when the user has chosen a mod,
    * selected an opponent, and hit the "invite" button.
    *
    * This function sends a StartGameRequest to the server.
    */
    $scope.startGame = function() {
        if($scope.selected_mod && $scope.selected_opponent) {
            var startGame = new CardshifterServerAPI.messageTypes.StartGameRequest($scope.selected_opponent,
                                                                                   $scope.selected_mod);
            CardshifterServerAPI.sendMessage(startGame);
            gameMod = $scope.selected_mod;
        } else {
            // Error if user has not chosen a mod or opponent
            var message = new CardshifterServerAPI.messageTypes.ChatMessage(
                        "Client error: Select both a game type and an opponent user before you can start a game.");
            addChatMessage(message);
        }
    };

    /**
    * This function is called when either the "accept" or "decline"
    * button of the invite pop-up has been clicked.
    *
    * This function sends an InviteResponse message to the server and
    * and passes in the accept argument to the constructor. If the
    * user hit "accept", then the accept argument will be true. If
    * the user hit "decline", then the accept argument will be false.
    *
    * @param accept:boolean -- true for "accept"
                            -- false for "decline"
    */
    $scope.acceptInvite = function(accept) {
        var accept = new CardshifterServerAPI.messageTypes.InviteResponse($scope.invite.id, accept);
        CardshifterServerAPI.sendMessage(accept);

        gameMod = $scope.invite.type;
        $scope.gotInvite = false;
    };

    /**
    * This function is called once the user has selected a mod
    * and has clicked the "Deck Builder" button near the top of the
    * screen. If the user has not yet selected a mod, then this
    * function does nothing.
    *
    * Once this is run, a ServerQueryMessage is sent to the server
    * to retrieve all the cards. The reason why this has to be sent
    * manually is because the server does not know when the user
    * is entering the deck builder, so it does not know to send
    * the card information automatically, as opposed to if the user
    * were entering a new game.
    */
    $scope.openDeckBuilder = function() {
        if($scope.selected_mod) {
            currentUser.game.mod = $scope.selected_mod;

            var getCards = new CardshifterServerAPI.messageTypes.ServerQueryMessage("DECK_BUILDER", currentUser.game.mod);
            CardshifterServerAPI.sendMessage(getCards);
            $location.path("/deck_builder");
        } else {
            var message = new CardshifterServerAPI.messageTypes.ChatMessage(
                        "Client error: Select a game type before you can open the deck builder.");
            addChatMessage(message);
        }
    };


    // The command map functions:
    /**
    * Based on the content of message, will add or remove
    * a user from the user list.
    */
    function updateUserList(message) {
        if(message.status === "OFFLINE") {
            for(var i = 0, length = $scope.users.length; i < length; i++) {
                if($scope.users[i].userId === message.userId) {
                    $scope.users.splice(i, 1); // remove that user from the array
                    return;
                }
            }
        } else {
            $scope.users.push(message);
        }
    };
    /**
    * Adds a chat message to the message feed. If the message
    * feed is at the maximum limit of messages, deletes the oldest
    * message.
    */
    function addChatMessage(message) {
        if($scope.chatMessages.length === CHAT_FEED_LIMIT) {
            // remove the oldest chat message
            $scope.chatMessages.shift();
        }

        var now = new Date();

        var YMD = [formatTimeNumber(now.getFullYear()), formatTimeNumber(now.getMonth() + 1), formatTimeNumber(now.getDate())].join('-');
        var HMS = [formatTimeNumber(now.getHours()), formatTimeNumber(now.getMinutes()), formatTimeNumber(now.getSeconds())].join(':');
        message.timestamp = YMD + " " + HMS;

        $scope.chatMessages.push(message);
    };
    /**
    * Shows buttons and a message to this client for accepting
    * or declining a game request.
    */
    function displayInvite(message) {
        $scope.invite.id = message.id;
        $scope.invite.name = message.name;
        $scope.invite.type = message.gameType;
        $scope.gotInvite = true;

        ping.play();
    };
    /**
    * Shows to the user a list of all available mods.
    */
    function displayMods(message) {
        window.availableGameMods = message.mods; // for deck builder and for returning to this page
        $scope.mods = message.mods;
    };
    /**
    * Stores the game ID in currentUser for other controllers
    * to use and navigates to the deck-builder page for the
    * user to select a deck.
    */
    function enterNewGame(message) {
        currentUser.game.id = message.gameId;
        currentUser.game.mod = gameMod;
        currentUser.game.playerIndex = message.playerIndex;

        $location.path("/deck_builder");
    };

    /**
    * If a number is less than 10, this function will
    * return a '0' appended to the beginning of that number
    *
    * This allows for cleanly formatted timestamps on chat messages.
    *
    * @param time:number -- The number to check
    * @param string -- If the number is less than 10, '0' + time
                    -- If not, just time itself.
    */
    function formatTimeNumber(time) {
        return time < 10 ? "0" + time : time;
    };
}

module.exports = LobbyController;
