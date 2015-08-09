CardshifterApp.controller("DeckbuilderController", function($scope) {
    $scope.cards = [];
    $scope.maxCards = 0;
    $scope.minCards = 0;
    $scope.currentDeck = {};
    $scope.cardInfo = {};

    CardshifterServerAPI.setMessageListener(function(cardInformation) {
        var deck = cardInformation.configs.Deck;

        window.SIRPYTHONTESTINGINCORPORATED = cardInformation;

        for(var card in deck.cardData) {
            deck.cardData[card].max = deck.max[card] || deck.maxPerCard;
            $scope.currentDeck[deck.cardData[card].id] = 0;
        }

        $scope.cards = deck.cardData;
        $scope.maxCards = deck.maxSize;
        $scope.minCards = deck.minCards;

        $scope.$apply();
    }, ["playerconfig"]);

    $scope.decrement = function(card) {
        if($scope.currentDeck[card.id] !== 0) {
            $scope.currentDeck[card.id]--;
        }
    }
    $scope.increment = function(card) {
        if($scope.getTotalSelected() !== $scope.maxCards &&
           $scope.currentDeck[card.id] !== card.max) {
            $scope.currentDeck[card.id]++;
        }
    }

    $scope.getTotalSelected = function() {
        var total = 0
        for(var card in $scope.currentDeck) {
            total += $scope.currentDeck[card];
        }
        return total;
    }

    $scope.showDetails = function(card) {
        var props = card.properties;
        $scope.cardInfo = {
            name: props.name,
            flavor: props.flavor,
            type: props.creatureType,
            health: props.HEALTH,
            attack: props.ATTACK,
            sickness: props.SICKNESS
        };
    }
});