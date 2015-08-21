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
    $scope.targets = [];
    $scope.selected = [];
    $scope.currentAction;

    var commandMap = {
        "resetActions": resetActions,
        "useable": addUsableAction,
        "player": storePlayerInfo,
        "zone": setZone,
        "card": storeCard,
        "zoneChange": moveCard,
        "targets": setTargets,
        "update": updatePlayerProperties
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
    }, ["resetActions", "useable", "player", "zone", "card", "zoneChange", "targets", "update"]);


    $scope.startAction = function(action) {
        if($scope.targets.length === 0) { // there were no targets set automatically by action ID's
            var getTargets = new CardshifterServerAPI.messageTypes.RequestTargetsMessage(currentUser.game.id,
                                                                                         playerInfos.user.id,
                                                                                         action.action);
            CardshifterServerAPI.sendMessage(getTargets);
        }

        $scope.currentAction = action;
        $scope.doingAction = true;
    }
    $scope.cancelAction = function() {
        $scope.doingAction = false;
        $scope.targets = [];
        $scope.selected = [];
    }

    $scope.performAction = function() {
        if($scope.selected.length === 0 && $scope.currentAction.targetRequired) {
            console.log("target(s) required");
            return;
        }

        var doAbility = null;

        if(!findPlayer($scope.currentAction.id)) { // if action is performed by player
            var selectedIDs = [];
            for(var i = 0, length = $scope.selected.length; i < length; i++) {
                selectedIDs.push($scope.selected[i].id);
            }

            var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(currentUser.game.id,
                                                                                    playerInfos.user.id,
                                                                                    $scope.currentAction.action,
                                                                                    selectedIDs);
        } else { // if action is performed by user
            var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(currentUser.game.id,
                                                                                    $scope.currentAction.id,
                                                                                    $scope.currentAction.action,
                                                                                    [0]);
        }

        CardshifterServerAPI.sendMessage(doAbility);
        $scope.cancelAction();
    }

    $scope.selectCard = function(card) {
        var selected = $scope.selected;
        var index = selected.indexOf(card);

        if(index === -1) {      // select
            selected.push(card);
        } else {                // de-select
            selected.splice(index, 1);
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
    * This will only add the action to $scope.actions if there
    * is not another action with the same name in there.
    */
    function addUsableAction(action) {
        if(!findPlayer(action.id)) { // some action's IDs are the target, rather than the player
            $scope.targets.push(action.id);
            //return;
        }

        var actions = $scope.actions;
        var notDuplicate = true;

        for(var i = 0, length = actions.length; i < length; i++) {
            if(actions[i].action === action.action) { // not a duplicate
                notDuplicate = false;
                break;
            }
        }

        if(notDuplicate) {
            actions.push(action);
        }
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
    * Moves a single card from one zone to another
    *
    * @param message:ZoneChangeMessage -- The zone change information
    *
    */
    function moveCard(message) {
        try {
            var src = findZone(message.sourceZone);
            var dest = findZone(message.destinationZone);

            var card = src.entities[message.entity];
            delete src.entities[message.entity];
            dest.entities[message.entity] = card;
        } catch(e) {
            /*
            * See the try/catch in storeCard.
            */
        }
    }

    /*
    * Sets the $scope.targets to all the available
    * targets for the current action.
    *
    * @param targets:AvailableTargetsMessage -- The available targets
    *
    * The HTML, depending on this $scope.targets value, will turn
    * a card name into a link for the user to select.
    */
    function setTargets(targets) {
        $scope.targets = targets.targets;
    }

    /*
    * Updates a players properties based on the message received.
    *
    * @param toUpdate:UpdateMessage -- The information on what to update
    *
    */
    function updatePlayerProperties(toUpdate) {
        findPlayer(toUpdate.id).properties[toUpdate.key] = toUpdate.value;
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
    /*
    * Finds and returns a player based on an ID
    *
    * @param id:number -- The ID of the player
    * @param Object -- playerInfos.user
    *               -- playerInfos.opponent
    *               -- null, if the ID does not belong to either player
    */
    function findPlayer(id) {
        if(id === playerInfos.user.id) {
            return  playerInfos.user;
        } else if(id === playerInfos.opponent.id) {
            return playerInfos.opponent;
        }
        return null;
    }
}

module.exports = GameboardController;