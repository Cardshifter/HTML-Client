'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location, $modal, ErrorCreator) {
    var playerInfos = {
        user: {
            index: null,
            id: null,
            name: null,
            animations: {},
            properties: {},
            zones: {}
        },
        opponent: {
            index: null,
            id: null,
            name: null,
            animations: {},
            properties: {},
            zones: {}
        }
    };
    
    $scope.modName = currentUser.game.mod.toLowerCase().replace(' ', '-');

    $scope.cardZones = {}; // contains information about what card is where.
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
        "entityRemoved": removeEntity,
        "card": storeCard,
        "zoneChange": moveCard,
        "targets": setTargets,
        "update": updateProperties,
        "elimination": displayWinner,
        "error": displayError
    };

    CardshifterServerAPI.setMessageListener(commandMap, $scope);


    $scope.startAction = function(action) {
        if(!action.targetRequired) { // No targets? No confirmation. Do we understand each other?
            $scope.currentAction = action;
			var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(currentUser.game.id,
																				$scope.currentAction.id,
																				$scope.currentAction.action);

			CardshifterServerAPI.sendMessage(doAbility);
			$scope.cancelAction();
            return;
        }
		
		// if a target is required, request targets
		var getTargets = new CardshifterServerAPI.messageTypes.RequestTargetsMessage(currentUser.game.id,
				action.id, action.action);
		CardshifterServerAPI.sendMessage(getTargets);

        $scope.currentAction = action;
        $scope.doingAction = true;
    };
	
    $scope.cancelAction = function() {
        $scope.doingAction = false;
        $scope.targets = [];
        for (var i = 0; i < $scope.selected.length; i++) {
            $scope.selected[i].selected = false;
        }
        $scope.selected = [];
    };

    $scope.performAction = function() {
		var action = $scope.currentAction;
		var selected = $scope.selected;
		var minTargets = $scope.targetsMessage.min;
		var maxTargets = $scope.targetsMessage.max;
		if (selected.length < minTargets || selected.length > maxTargets) {
			console.log("target(s) required: " + minTargets + " - " + maxTargets + " but chosen " + selected.length);
			ErrorCreator.create("target(s) required: " + minTargets + " - " + maxTargets + " but chosen " + selected.length);
			return;
		}

        var doAbility = null;

		var selectedIDs = [];
		for(var i = 0, length = $scope.selected.length; i < length; i++) {
			selectedIDs.push($scope.selected[i].id);
		}

		var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(currentUser.game.id,
																				$scope.currentAction.id,
																				$scope.currentAction.action,
																				selectedIDs);

        CardshifterServerAPI.sendMessage(doAbility);
        $scope.cancelAction();
    };

    $scope.selectEntity = function(entity) {
        if (!$scope.doingAction) {
            return;
        }
        var selected = $scope.selected;
        var index = selected.indexOf(entity);

        if(index === -1) {      // select
            selected.push(entity);
            entity.selected = true;
        } else {                // de-select
            selected.splice(index, 1);
            entity.selected = false;
        }
        
        // if action requires exactly one target, perform action when target is chosen
        if ($scope.targetsMessage.min === 1 && $scope.targetsMessage.max === 1) {
            $scope.performAction();
        }
    };


    /**
    * Resets all the available actions that the user has.
    */
    function resetActions() {
        $scope.actions = [];
    };

    /**
    * Adds another possible action to the possible actions
    * that this user can complete on their turn.
    *
    * @param action:UsableActionMessage -- The action to add
    *
    * This will only add the action to $scope.actions if there
    * is not another action with the same name in there.
    */
    function addUsableAction(action) {
        var actions = $scope.actions;

        if(findPlayer(action.id)) { // ID is not target
            action.isPlayer = true;
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
        } else { // ID is target
            action.isPlayer = false;
            actions.push(action);
        }
    };

    /**
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
    };

    /**
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
                        var entityId = zone.entities[i];
                        newEntities[entityId] = {}; // setup each ID to be an key holding an object to store card info
                        $scope.cardZones[entityId] = zone.id;
                    }
                    zone.entities = newEntities;
					zone.length = function () {
						return Object.keys(this.entities).length;
					}

                    playerInfos[player].zones[zone.name] = zone;
                    break;
                }
            }
        }
    };

    /**
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
        card.animations = {};
        
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
    };

    /**
    * Moves a single card from one zone to another
    *
    * @param message:ZoneChangeMessage -- The zone change information
    *
    */
    function moveCard(message) {
        try {
            var src = findZone(message.sourceZone);
            var dest = findZone(message.destinationZone);
            var card = null;
            // when a card is suddenly summoned, sourceZone is -1, which doesn't exist
            if (src) {
                card = src.entities[message.entity];
                delete src.entities[message.entity];
            }
            $scope.cardZones[message.entity] = message.destinationZone;
            dest.entities[message.entity] = card;
        } catch(e) {
            /*
            * See the try/catch in storeCard.
            */
        }
    };
	
    /**
    * Removes a card from the zone it is in
    *
    * @param message:EntityRemoveMessage -- Remove information
    */
	function removeEntity(message) {
		var entityId = message.entity;
        var zoneId = $scope.cardZones[entityId];
        var zone = findZone(zoneId);
        delete zone.entities[entityId];
        delete $scope.cardZones[entityId];
	};

    /**
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
		$scope.targetsMessage = targets;
    };

    /**
    * Updates properties based on the message received.
    *
    * @param toUpdate:UpdateMessage -- The information on what to update
    *
    */
    function updateProperties(toUpdate) {
        var entity = findEntity(toUpdate.id);
        if (!entity) {
            // this can happen when Server sends update message before CardInfoMessage
            return;
        }
        if (!entity.properties) {
            // this can happen when Server sends update message before CardInfoMessage
            return;
        }
        var oldValue = entity.properties[toUpdate.key];
        entity.properties[toUpdate.key] = toUpdate.value;
        if (typeof toUpdate.value === 'number') {
            var diff = toUpdate.value - oldValue;
            if (!entity.animations) {
                entity.animations = {};
            }
            var anim = entity.animations[toUpdate.key];
            var animObject = { diff: diff };
            if (anim) {
                anim.push(animObject);
            } else {
                entity.animations[toUpdate.key] = [ animObject ];
            }
        }
    };

    /**
    * Displays the winner to the user and then navigates back
    * to the lobby.
    *
    * @param elimination:PlayerEliminatedMessage -- The elimination information
    *
    */
    function displayWinner(elimination) {
        var id = elimination.id;
        var winner = elimination.winner;
        var results = "You ";
        
        if (findPlayer(id) !== playerInfos.user) {
            return; // avoid showing modal twice
        }

        if (winner) {
            results += "win";
        } else {
            results += "lose";
        }

        var modalInstance = $modal.open({
            animation: true,
            backdrop: 'static',
            template: require('../game_results/game_results.html'),
            controller: 'GameOverMessageController',
            size: 'sm',
            resolve: {
                message: function () {
                    return results;
                }
            }
        });

        modalInstance.result.then(function () {
            $location.path("/lobby");
        });

        
    };

    /**
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
    };
    /**
    * Finds and returns a player based on an ID
    *
    * @param id:number -- The ID of the player
    * @param Object -- playerInfos.user
    *               -- playerInfos.opponent
    *               -- null, if the ID does not belong to either player
    */
    function findPlayer(id) {
        if(id === playerInfos.user.id) {
            return playerInfos.user;
        } else if(id === playerInfos.opponent.id) {
            return playerInfos.opponent;
        }
        return null;
    };
    
    /**
    * Finds and returns an entity based on an ID
    *
    * @param id:number -- The ID of the entity
    * @param Object -- playerInfos.user or playerInfos.opponent
    *               -- a card object
    *               -- null, if no entity with that ID was found
    */
    function findEntity(id) {
        var player = findPlayer(id);
        if (player) {
            return player;
        } else {
            var zoneId = $scope.cardZones[id];
            var zone = findZone(zoneId);
            if (!zone) {
                console.log('unable to find entity ' + id + ', last known zone not found: ' + zoneId);
                return null;
            }
            if (zone.entities[id]) {
                return zone.entities[id];
            }
        }
        return null;
    };

    function displayError(message) {
        ErrorCreator.create(message.message);
    }
}

module.exports = GameboardController;