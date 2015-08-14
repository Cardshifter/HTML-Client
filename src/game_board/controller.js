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
    $scope.playerInfos = playerInfos;

    var commandMap = {
        "resetActions": resetActions,
        "useable": addUsableAction,
        "player": storePlayerInfo,
        "zone": setZone,
        "card": storeCard
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
    }, ["resetActions", "useable", "player", "zone", "card"]);


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
                    var newEntities = {};
                    for(var i = 0, length = zone.entities.length; i < length; i++) {
                        newEntities[zone.entities[i]] = {}; // setup each ID to be an key holding an object to store card info
                    }
                    zone.entities = newEntities;

                    playerInfos[player].zones[zone.name] = zone;
                    break;
                }
            }
        }
    }

    /*
    * Stores a CardInfoMessage in the appropriate zone,
    * which is going to be in either the user's zones, or
    * the opponent's zones.
    *
    * @param card:CardInfoMessage -- The card to store.
    *
    * This function will not store the CardInfoMessage if the
    * zone is not ".known".
    */
    function storeCard(card) {
        var destinationZone = findZone(card.zone);

        try {
            if(destinationZone.known) {
                destinationZone.entities[card.id] = card;
            }
        } catch(e) {
            /* Do nothing. The reason why an error
            * might occur probably has something to
            * do with how the server is sending messages.
            *
            * For Mythos, 10 cards are sent: two groups of
            * 5. Both groups are identical. However, the
            * first group will always fail.
            *
            * The reason for this is because Mythos will send
            * CardInfoMessages before it has sent the
            * ZoneMessages, which means that this function
            * won't know where to put the cards. However,
            * since the initial ZoneChangeMessages and
            * CardInfoMessages in Mythos don't matter, it is
            * safe to ignore this error.
            */
        }
    }

    /*
    * Return the zone of the passed in ID.
    *
    * @param id:number -- The ID of the zone.
    * @return Object -- The zone
    *                -- null, if a zone with id doesn't exist
    */
    function findZone(id) {
        var zoneGroups = [playerInfos.user.zones, playerInfos.opponent.zones];

        for(var i = 0, length = zoneGroups.length; i < length; i++) {
            for(var zone in zoneGroups[i]) {
                if(zoneGroups[i].hasOwnProperty(zone)) {
                    if(zoneGroups[i][zone].id === id) {
                        return zoneGroups[i][zone];
                    }
                }
            }
        }
        return null;
    }
}

module.exports = GameboardController;