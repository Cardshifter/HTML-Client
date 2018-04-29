/* global CardshifterServerAPI */

"use strict";

const deckBuilderController = function() {
    
    /**
     * Handles interactions between the browser client and the game server.
     * @returns {undefined}
     */
    const handleWebSocketConnection = function() {
        CardshifterServerAPI.setMessageListener(function(wsMsg) {
            if (wsMsg.command === "playerconfig") {
                console.log(JSON.stringify(wsMsg));
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