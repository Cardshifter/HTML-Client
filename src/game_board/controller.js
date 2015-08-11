'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {

    var commandMap = {
        "zoneMessage": debug,
        "cardInfo": debug
    };

    CardshifterServerAPI.setMessageListener(function(message) {
        commandMap[message.command](message);
    }, ["zoneMessage", "cardInfo"]);

    function debug(message) {
        console.log("Received a [" + message.command + "] message:");
        console.log(message);
        console.log("----------");
    }
}

module.exports = GameboardController;