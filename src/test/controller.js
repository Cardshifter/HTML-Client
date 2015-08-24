'use strict';

// @ngInject
function TestController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    $scope.zoneInfo = {
        entities: {
            14: {
                id: 14,
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
}

module.exports = TestController;
