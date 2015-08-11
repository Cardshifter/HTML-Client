'use strict';

// @ngInject
function DeckbuilderController(CardshifterServerAPI, $scope, $rootScope, $location) {
    var DECK_STORAGE = "CARDSHIFTER_DECK_STORAGE";

    $scope.cards = [];
    $scope.maxCards = 0;
    $scope.minCards = 0;
    $scope.currentDeck = {};
    $scope.cardInfo = {};
    $scope.currentDeckName = "untitled";
    $scope.savedDecks = [];
    $scope.doneLoading = false;
    $scope.enteringGame = currentUser.game.id;

    // This is sort of a repeat of currentDeck, because I didn't know that the client had to send the message back
    var deckConfig = null; // the message received from the server

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
        deckConfig = cardInformation
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

    $scope.enterGame = function() {
        if($scope.getTotalSelected() === $scope.minCards) {

            // remove all unpicked cards from the deck like the Java client(needed?)
            for(var card in $scope.currentDeck) {
                if($scope.currentDeck.hasOwnProperty(card)) {
                    if($scope.currentDeck[card] === 0) {
                        delete $scope.currentDeck[card];
                    }
                }
            }

            // remove all .max properties so server does die
            for(var card in $scope.currentDeck) {
                delete $scope.currentDeck[card].max;
            }

            deckConfig.configs.Deck.chosen = $scope.currentDeck;
            CardshifterServerAPI.sendMessage(deckConfig);

            $location.path("/game_board");
        } else {
            console.log("not enough cards");
        }
    };
    $scope.goBack = function() {
        $location.path("/lobby");
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
}

module.exports = DeckbuilderController;
