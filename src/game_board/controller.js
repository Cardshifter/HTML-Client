'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {

    var commandMap = {
        "zoneMessage": debug,
        "cardInfo": debug
    };

    var i = 0;
    CardshifterServerAPI.setMessageListener(function(message) {
        //commandMap[message.command](message);
        debug(message);
    });

    function debug(message) {
        i++;
        console.log(i);
        console.log("Received a [" + message.command + "] message:");
        console.log(message);
        console.log("----------");
    }
}

module.exports = GameboardController;