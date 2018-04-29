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
                }
            }
        });
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