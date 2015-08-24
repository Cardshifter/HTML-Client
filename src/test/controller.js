'use strict';

// @ngInject
function TestController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    $scope.zoneInfo = {
        entities: {
            14: {
                properties: {
                    name: 'Hello',
                    imagePath: 'mythos/default.png',
                    HEALTH: 4,
                    ATTACK: 1,
                    MANA_COST: 45,
                }
            },
        }
    };
}

module.exports = TestController;
