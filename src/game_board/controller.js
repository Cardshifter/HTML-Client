'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    var playerInfos = {
        user: {
            index: null,
            id: null,
            name: null,
            properties: {},
            zones: {}
        },
        opponent: {
            index: null,
            id: null,
            name: null,
            properties: {},
            zones: {}
        }
    };

    $scope.actions = [];
    $scope.doingAction = false;
    $scope.playersProperties = []; // is this good, or can it just be playerInfos?

    var commandMap = {
        "resetActions": resetActions,
        "useable": addUsableAction,
        "player": storePlayerInfo,
        "zone": setZone
    };

    /*
    * TODO: Find out a way to handle ZoneChangeMessages, so that
    * the listener will work both at the beginning of the game
    * and during the middle of the game. Thought: The first
    * zone messages in the beginning might be okay to ignore; it'd
    * be hard to understand ZoneChangeMessages before receiving a
    * ZoneMessage (which Mythos does).
    */
    CardshifterServerAPI.setMessageListener(function(message) {
        commandMap[message.command](message);
        $scope.$apply();
    }, ["resetActions", "useable", "player", "zone"]);


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

    /*
    * Stores the information about a zone by the
    * zone's name in
    * playerInfos.<player>.zones.<zone_name>
    *
    * @param zone:ZoneMessage -- The zone to add
    *
    * This will skip all "Cards" messages.
    */
    function setZone(zone) {
        if(zone.name === "Cards") { // "Not currently used as it is too meta."
            return;
        }

        for(var player in playerInfos) {
            if(playerInfos.hasOwnProperty(player)) {
                if(playerInfos[player].id === zone.owner) {
                    playerInfos[player].zones[zone.name] = zone;
                    break;
                }
            }
        }
        console.log(playerInfos);
        console.log("--------------");
    }
}

module.exports = GameboardController;