CardshifterApp.controller("DeckbuilderController", function($scope) {
    var DECK_STORAGE = "CARDSHIFTER_DECK_STORAGE";

    $scope.cards = [];
    $scope.maxCards = 0;
    $scope.minCards = 0;
    $scope.currentDeck = {};
    $scope.cardInfo = {};
    $scope.currentDeckName = "untitled";
    $scope.savedDecks = [];
    $scope.doneLoading = false;

    if(!localStorage.getItem(DECK_STORAGE)) {
        var json = "{\"decks\": {";
        for(var i = 0, length = availableGameMods.length; i < length; i++) {
            json += "\"" + availableGameMods[i] + "\":[],";
        }
        json = json.slice(0, -1); // remove last comma
        json += "}}";
        localStorage.setItem(DECK_STORAGE, json);
    }

    CardshifterServerAPI.setMessageListener(function(cardInformation) {
        var deck = cardInformation.configs.Deck;

        for(var card in deck.cardData) {
            if(deck.cardData.hasOwnProperty(card)) {
                deck.cardData[card].max = deck.max[card] || deck.maxPerCard;
                $scope.currentDeck[deck.cardData[card].id] = 0;
            }
        }

        $scope.cards = deck.cardData;
        $scope.maxCards = deck.maxSize;
        $scope.minCards = deck.minSize;
        updateSavedDecks();
        $scope.doneLoading = true;

        $scope.$apply();
    }, ["playerconfig"]);

    $scope.decrement = function(card) {
        if($scope.currentDeck[card.id] !== 0) {
            $scope.currentDeck[card.id]--;
        }
    };
    $scope.increment = function(card) {
        if($scope.getTotalSelected() !== $scope.maxCards &&
           $scope.currentDeck[card.id] !== card.max) {
            $scope.currentDeck[card.id]++;
        }
    };

    $scope.getTotalSelected = function() {
        var total = 0;
        for(var card in $scope.currentDeck) {
            if($scope.currentDeck.hasOwnProperty(card)) {
                total += $scope.currentDeck[card];
            }

        }
        return total;
    };

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
    };

    $scope.saveDeck = function() {
        if($scope.getTotalSelected() === $scope.minCards) {
            if($scope.deckName) {
                if(!getDeckIndex($scope.deckName)) { // if deck exists
                    var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));

                    var newDeck = {
                        name: $scope.deckName,
                        cards: $scope.currentDeck
                    };

                    savedDecks.decks[currentUser.game.mod].push(newDeck);
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
    };
    $scope.switchDeck = function(deck) {
        $scope.currentDeckName = deck.name;
        $scope.currentDeck = deck.cards;
    };
    $scope.deleteDeck = function(deckName) {
        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));
        savedDecks.decks[currentUser.game.mod].splice(getDeckIndex(deckName), 1);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));

        updateSavedDecks();
    };

    function updateSavedDecks() {
        $scope.savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE)).decks[currentUser.game.mod];
    }
    function getDeckIndex(deckName) {
        for(var i = 0, length = $scope.savedDecks.length; i < length; i++) {
            if($scope.savedDecks[i].name === deckName) {
                return i;
            }
        }
        return false;
    }
});