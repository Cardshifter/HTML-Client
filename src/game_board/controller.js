'use strict';

// @ngInject
function GameboardController(CardshifterServerAPI, $scope, $timeout, $rootScope, $location) {
    var STARTING_CARD_AMT = 5; // not very flexible

    $scope.hand = [];
    $scope.actions = [];


    var commandMap = {
        "card": addToHand,
        "resetActions": resetActions,
        "useable": addUsableAction
    };


    CardshifterServerAPI.setMessageListener(function(message) {
        commandMap[message.command](message);
        $scope.$apply();
    }, ["card", "resetActions", "useable"]);


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
            // what needs to be done here?
            // keep analyzing server messages
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
    */
    function addUsableAction(action) {
        $scope.actions.push(action);
    }
}

module.exports = GameboardController;