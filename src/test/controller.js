'use strict';

// @ngInject
function TestController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    $scope.addCard = function() {
        var ents = $scope.zoneInfo.entities;
        var max = 0;
        for (var key in ents) {
            if (ents.hasOwnProperty(key)) {
                max = Math.max(max, key);
            }
            
        }
        max++;
        
        ents[max] = {
            id: max,
            animations: {},
            properties: {
                name: 'Hello',
                imagePath: 'mythos/default.png',
                HEALTH: 42,
                ATTACK: 1,
                MANA_COST: 45,
                flavor: 'This is a test',
                creatureType: 'Creature Type',
                effect: 'This is a description that can be very long that we somehow have to fit into the card. It can also contain\nmultiple lines.'
            }
        };
    }
    
    $scope.zoneInfo = {
        entities: {
            14: {
                id: 14,
                animations: {},
                properties: {
                    name: 'Hello',
                    imagePath: 'mythos/default.png',
                    HEALTH: 42,
                    ATTACK: 1,
                    MANA_COST: 45,
                    flavor: 'This is a test',
                    creatureType: 'Creature Type',
                    effect: 'This is a description that can be very long that we somehow have to fit into the card. It can also contain\nmultiple lines.'
                }
            },
        }
    };
    
    $scope.actions = [{
        command: 'useable',
        id: 14,
        action: 'Damage',
        targetRequired: false,
        targetId: 0,
        isPlayer: false
    }];
    $scope.doingAction = false;
    $scope.targets = [];
    $scope.selected = [];
    
    $scope.startAction = function(action) {
        if (action.action === 'Damage') {
            var entity = $scope.zoneInfo.entities[action.id];
            var diff = -1;
            var oldValue = entity.properties.HEALTH;
            entity.properties.HEALTH -= 1;
            
            var anim = entity.animations.HEALTH;
            var animObject = { diff: diff };
            if (anim) {
                anim.push(animObject);
            } else {
                entity.animations.HEALTH = [ animObject ];
            }
        }
    }
    
}

module.exports = TestController;
