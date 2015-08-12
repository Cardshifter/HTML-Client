'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    var STARTING_CARD_AMT = 5; // not very flexible

    var playerInfos = {
        user: {
            index: null,
            id: null,
            name: null,
            properties: {},
            hand: []
        },
        opponent: {
            index: null,
            id: null,
            name: null,
            properties: {},
            hand: []
        }
    };

    $scope.actions = [];
    $scope.doingAction = false;
    $scope.playersProperties = [];

    var commandMap = {
        "card": addToHand,
        "resetActions": resetActions,
        "useable": addUsableAction,
        "player": storePlayerInfo
    };


    CardshifterServerAPI.setMessageListener(function(message) {
        commandMap[message.command](message);
        $scope.$apply();
    }, ["card", "resetActions", "useable", "player"]);


    $scope.doAction = function(action) {
        var getTargets = new CardshifterServerAPI.messageTypes.RequestTargetsMessage(currentUser.game.id,
                                                                                     playerInfos.user.id,
                                                                                     action.action);
        CardshifterServerAPI.sendMessage(getTargets);

        $scope.doingAction = true;
    }
    $scope.cancelAction = function() {
        $scope.doingAction = false;
    }

    /*
    * Adds a card sent by the server to the user's hand.
    *
    * @param card:CardInfoMessage -- The card to add
    *
    * This will only add the card to the user's hand if the
    * user's hand size is less that STARTING_CARD_AMT.
    *
    * TODO: The method stated above is an extremely
    * stupid and inflexible way of handling CardInfoMessages.
    * Work on finding a better way to handle these.
    */
    function addToHand(card) {
        if(playerInfos.user.hand.length < STARTING_CARD_AMT) {
            playerInfos.user.hand.push(card);
        } else {
            // what needs to be done here?
            // keep analyzing server messages
        }
    }

    /*
    * Resets all the available actions that the user has.
    */
    function resetActions() {
        $scope.actions = [];
    }

    /*
    * Adds another possible action to the possible actions
    * that this user can complete on their turn.
    *
    * @param action:UsableActionMessage -- The action to add
    *
    */
    function addUsableAction(action) {
        $scope.actions.push(action);
    }

    /*
    * Stores the information in player into either
    * playerInfos.user if this user is being
    * described in the message, or playerInfos.opponent
    * if the opponent is being described in the message.
    *
    * @param player:PlayerMessage -- The player info to store
    *
    */
    function storePlayerInfo(player) {
        var playerInfo;

        if(player.index === currentUser.game.playerIndex) {
            playerInfo = playerInfos.user;
        } else {
            playerInfo = playerInfos.opponent;
        }

        playerInfo.index = player.index;
        playerInfo.id = player.id;
        playerInfo.name = player.name;
        playerInfo.properties = player.properties;

        $scope.playersProperties.push(playerInfo); // will this allow for dynamic updating?
    }
}

module.exports = GameboardController;