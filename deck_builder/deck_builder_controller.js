CardshifterApp.controller("DeckbuilderController", function($scope) {
    var DECK_STORAGE = "CARDSHIFTER_DECK_STORAGE";

    $scope.cards = [];
    $scope.maxCards = 0;
    $scope.minCards = 0;
    $scope.currentDeck = {};
    $scope.cardInfo = {};
    $scope.currentDeckName = "untitled";
    $scope.savedDecks = [];

    if(!localStorage.getItem(DECK_STORAGE)) {
        localStorage.setItem(DECK_STORAGE, "{\"decks\": []}");
    }

    CardshifterServerAPI.setMessageListener(function(cardInformation) {
        var deck = cardInformation.configs.Deck;
        console.log(deck);

        window.SIRPYTHONTESTINGINCORPORATED = cardInformation;

        for(var card in deck.cardData) {
            deck.cardData[card].max = deck.max[card] || deck.maxPerCard;
            $scope.currentDeck[deck.cardData[card].id] = 0;
        }

        $scope.cards = deck.cardData;
        $scope.maxCards = deck.maxSize;
        $scope.minCards = deck.minSize;

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

    $scope.saveDeck = function() {
        if($scope.getTotalSelected() === $scope.minCards) {
            if($scope.deckName) {
                if(!deckExists($scope.deckName)) {
                    var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));

                    var newDeck = {
                        name: $scope.deckName,
                        cards: $scope.currentDeck
                    };

                    savedDecks.decks.push(newDeck);
                    localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));
                    updateSavedDecks();

                    $scope.switchDeck(newDeck);
                } else {
                    console.log("deck already exists");     // bad looking nesting
                }
            } else {
                console.log("please enter name");
            }
        } else {
            console.log("not enough cards");
        }
    }
    $scope.switchDeck = function(deck) {
        $scope.currentDeckName = deck.name;
        $scope.currentDeck = deck.cards;
    }

    function updateSavedDecks() {
        $scope.savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE)).decks;
    }
    function deckExists(name) {
        for(var i = 0, length = $scope.savedDecks.length; i < length; i++) {
            if($scope.savedDecks[i].name === name) {
                return true;
            }
        }
        return false;
    }
});