CardshifterApp.controller("DeckbuilderController", function($scope) {
    $scope.cards = [];
    $scope.maxCards;
    $scope.cardChoices = {};
    $scope.cardInformation;

    CardshifterServerAPI.setMessageListener(function(cardInformation) {
        var deck = cardInformation.configs.Deck;

        for(card in deck.cardData) {
            deck.cardData[card].max = (deck.max[card] ? deck.max[card] : deck.maxPerCard); // bad to add property?
            $scope.cardChoices[deck.cardData[card].properties.name] = 0;
        }

        $scope.cards = deck.cardData;
        $scope.maxCards = deck.maxSize;

        $scope.$apply();
    }, ["playerconfig"]);

    $scope.showDetails = function(card) {
        $scope.cardInformation = "";
        for(var property in card.properties) {
            $scope.cardInformation += (property + ": " + card.properties[property] + "\n");
        }
    }

    $scope.getTotalSelected = function() {
        var total = 0;
        for(var card in $scope.cardChoices) {
            total += $scope.cardChoices[card];
        }
        return total;
    }

    $scope.increment = function(card) {
        if($scope.getTotalSelected() !== $scope.maxCards) {
            if($scope.cardChoices[card.properties.name] !== card.max) {
                $scope.cardChoices[card.properties.name]++;
            }
        }
    }
    $scope.decrement = function(card) {
        if($scope.cardChoices[card.properties.name] !== 0) {
            $scope.cardChoices[card.properties.name]--;
        }
    }
});