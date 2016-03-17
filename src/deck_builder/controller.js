'use strict';

// @ngInject
function DeckbuilderController(CardshifterServerAPI, $scope, $rootScope, $location, ErrorCreator) {
    var DECK_STORAGE = "CARDSHIFTER_DECK_STORAGE";

    $scope.cards = [];
    $scope.maxCards = 0;
    $scope.minCards = 0;
    $scope.currentDeck = {};
    $scope.cardInfo = null;
    $scope.currentDeckName = "untitled";
    $scope.savedDecks = [];
    $scope.doneLoading = false;
    $scope.enteringGame = currentUser.game.id;

    // This is sort of a repeat of currentDeck, because I didn't know that the client had to send the message back
    var deckConfig = null; // the message received from the server

    if(!localStorage.getItem(DECK_STORAGE)) {
        var mods = {};
        for (var i in availableGameMods) {
            mods[availableGameMods[i]] = [];
        }
        var json = JSON.stringify({
            decks: mods
        });
        localStorage.setItem(DECK_STORAGE, json);
    }

    CardshifterServerAPI.setMessageListener({
        "playerconfig": function(cardInformation) {
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
        }
    }, $scope);

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
    * with the card object associated with the link that was
    * clicked and will simply stick it into a card directive
    * which is displayed at the top of the screen.
    *
    * TODO: Dynamically load $scope.cardInfo with card properties. #60
    */
    $scope.showDetails = function(card) {
        $scope.cardInfo = card;
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
            ErrorCreator.create("Not enough cards");
            console.log("not enough cards");
            return;
        }
        if(!$scope.deckName) {
            ErrorCreator.create("Please enter a name");
            console.log("enter name");
            return;
        }
        if(getDeckIndex($scope.deckName)) {
            ErrorCreator.create("A deck with that name already exists");
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

    /**
    * This function is called when the deck link of a deck
    * is clicked. This function will load the deck information
    * from Local Storage and display it on the screen in the
    * card table.
    *
    * @param deck:Object -- The deck to load
    */
    $scope.switchDeck = function(deck) {
        $scope.currentDeckName = deck.name;
        $scope.currentDeck = deck.cards;
    };

    /**
    * This function is called when the "delete" button next
    * to a deck name near the bottom of the page is clicked.
    *
    * This function will remove the specified deck from
    * Local Storage, and from the list at the bottom of the
    * screen.
    *
    * @param deckName:string -- The name of the deck to delete
    */
    $scope.deleteDeck = function(deckName) {
        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));
        savedDecks.decks[currentUser.game.mod].splice(getDeckIndex(deckName), 1);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));

        updateSavedDecks();
    };

    /**
    * This function is called when the "start game" button near the
    * bottom of the page is clicked. This function will not run
    * if the user has not selected enough cards.
    *
    * The "start game" button is only displayed if this deck builder
    * screen was opened via starting a new game from the lobby.
    *
    * This function will send all the deck information to the server
    * and then redirect to the game board screen.
    */
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
            ErrorCreator.create("Not enough cards");
            console.log("not enough cards");
        }
    };

    /**
    * This function is called once the "go back to the lobby" button
    * near the bottom of the page is clicked.
    *
    * This button is only visible if the deck builder was entered
    * via the "deck builder" button in the game lobby.
    *
    * This function simply redirects the page back to the lobby
    * screen.
    */
    $scope.goBack = function() {
        $location.path("/lobby");
    };

    /**
    * This function updates the $scope variable savedDecks with the
    * saved decks that are stored in Local Storage.
    *
    * This function will only load $scope.savedDecks with the decks of
    * the mod that the game or user specified.
    */
    function updateSavedDecks() {
        $scope.savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE)).decks[currentUser.game.mod];
    }

    /**
    * This function will search through all the saved decks in
    * $scope.savedDecks and try to find the deck with the name
    * deckName.
    *
    * @param deckName:string -- The name of the deck to look for.
    * @return number/boolean -- The index of the deck with the correct name in $scope.savedDecks
    *                        -- false if the deck was not found in $scope.savedDecks
    */
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
