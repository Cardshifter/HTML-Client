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

    /**
    * This is called when the minus-sign button for a card
    * has been clicked.
    *
    * This function will, based on the argument, will reduce
    * the amount of this card the user has by one. This can
    * not go below 0.
    *
    * @param card:Object -- The card to decrement
    */
    $scope.decrement = function(card) {
        if($scope.currentDeck[card.id] !== 0) {
            $scope.currentDeck[card.id]--;
        }
    };
    /**
    * This is called when the plus-sign button for a card
    * has been clicked.
    *
    * This function will, based on the argument, will
    * increase the amount of this card the user has by one.
    *
    * This can not go above the card's maximum limit, nor
    * can it go above the deck limit.
    *
    * @param card:Object -- The card to increment
    */
    $scope.increment = function(card) {
        if($scope.getTotalSelected() !== $scope.maxCards &&
           $scope.currentDeck[card.id] !== card.max) {
            $scope.currentDeck[card.id]++;
        }
    };

    /**
    * This is called by injection near the top of the document
    * to, in fractional form, how many cards are in the user's
    * current deck.
    */
    $scope.getTotalSelected = function() {
        var total = 0;
        for(var card in $scope.currentDeck) {
            if($scope.currentDeck.hasOwnProperty(card)) {
                total += $scope.currentDeck[card];
            }

        }
        return total;
    };

    /**
    * This is called when the card link of a card in the
    * available cards table has been clicked.
    *
    * Once this function is called, it loads $scope.cardInfo
    * with the most important properties of the card. Then,
    * the HTML will take care of not showing the card information
    * that is "undefined", as not all cards have the same properties.
    *
    * TODO: Dynamically load $scope.cardInfo with card properties. #60
    */
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

    /**
    * This is called by the "save deck" button at the bottom of the
    * screen. This function stores all the currently selected cards
    * in Local Storage.
    *
    * If the user has not selected enough cards, not given the deck
    * a name, or has given it name but it already exists, this function
    * will stop immediately.
    */
    $scope.saveDeck = function() {
        if($scope.getTotalSelected() !== $scope.minCards) {
            console.log("not enough cards");
            return;
        }
        if(!$scope.deckName) {
            console.log("enter name");
            return;
        }
        if(getDeckIndex($scope.deckName)) {
            console.log("deck already exists");
            return;
        }

        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));

        var newDeck = {
            name: $scope.deckName,
            cards: $scope.currentDeck
        };

        savedDecks.decks[currentUser.game.mod].push(newDeck);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));
        updateSavedDecks();

        $scope.switchDeck(newDeck);
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

            // remove all .max properties so server does not die
            for(var card in deckConfig.configs.Deck.cardData) {
                delete deckConfig.configs.Deck.cardData[card].max;
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
