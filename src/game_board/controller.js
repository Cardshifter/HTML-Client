'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    var STARTING_CARD_AMT = 5; // not very flexible

    $scope.hand = [];
    $scope.actionName = "";
    $scope.doingAction = "";

    var commandMap = {
        "card":
    };


    CardshifterServerAPI.setMessageListener(function(message) {
        commandMap[message.command](message);
        $scope.$apply();
    }, ["card"]);


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
        if($scope.hand.length < STARTING_CARD_AMT) {
            $scope.hand.push(card);
        } else {

        }
    }

    function debug(message) {
        console.log("Received a [" + message.command + "] message:");
        console.log(message);
        console.log("----------");
    }
}

module.exports = GameboardController;