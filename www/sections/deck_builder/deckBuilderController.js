/* global CardshifterServerAPI */

"use strict";

const deckBuilderController = function() {
    const deckData = {
        cardData : {},
        chosen : {},
        cardsWithMax : {},
        minSize : 0,
        maxSize : 0,
        currentSize : 0,
        maxPerCard : 0
    };
    
    const deckBuilderCardsSelected = document.getElementById("deck_builder_cards_selected");

    
    /**
     * Handles interactions between the browser client and the game server.
     * @returns {undefined}
     */
    const handleWebSocketConnection = function() {
        CardshifterServerAPI.setMessageListener(function(wsMsg) {
            if (wsMsg.command === "playerconfig") {
                //console.log(JSON.stringify(wsMsg));
                localStorage.setItem("gameId", wsMsg.gameId);
                localStorage.setItem("modName", wsMsg.modName);
                if (wsMsg.configs.Deck._type.toLowerCase() === "deckconfig") {
                    let deck = wsMsg.configs.Deck;
                    deckData.cardData = deck.cardData;
                    deckData.chosen = deck.chosen;
                    deckData.cardsWithMax = deck.max;
                    deckData.minSize = deck.minSize;
                    deckData.maxSize = deck.maxSize;
                    deckData.maxPerCard = deck.maxPerCard;
                    deck = null;
                    
                    updateDeckCardSummary();
                }
            }
        });
    };
    
    const updateDeckCardSummary = function() {
        const cardSummary = `Cards: ${deckData.currentSize} / min: ${deckData.minSize}, max: ${deckData.maxSize}`;
        deckBuilderCardsSelected.innerHTML = cardSummary;
    };

    /**
     * IIFE to control the deck builder.
     * @type undefined
     */
    const runDeckBuilderController = function() {
        logDebugMessage("deckBuilderController called");
        handleWebSocketConnection();
    }();
};