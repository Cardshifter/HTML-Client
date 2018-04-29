/* global CardshifterServerAPI */

"use strict";

const modColumns = {
    "Cyborg-Chronicles" : [
        {
            id : "name",
            displayName : "Name",
            width : "1fr",
            cssProperties : {}
        },
        {
            id : "count",
            displayName : "Count",
            width : "1fr",
            cssProperties : {}
        },
        {
            id : "manaCost",
            displayName : "Mana Cost",
            width : "1fr",
            cssProperties : {}
        },
        {
            id : "attackHealth",
            displayName : "Attack/Health",
            width : "1fr"
        },
        {
            id : "scrapValue",
            displayName : "Scrap Value",
            width : "1fr"
        },
        {
            id : "sickness",
            displayName : "Sickness",
            width : "1fr"
        },
        {
            id : "canAttack",
            displayName : "Can Attack?",
            width : "1fr"
        },
        {
            id : "effect",
            displayName : "Effect",
            width : "1fr"
        },
        {
            id :"flavor",
            displayName : "Flavor",
            width : "1fr"
        }
    ]
};

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
    const deckBuilderCardListTable = document.getElementById("deck_builder_card_list_table");
    
    /**
     * Handles interactions between the browser client and the game server.
     * @returns {undefined}
     */
    const handleWebSocketConnection = function() {
        CardshifterServerAPI.setMessageListener(function(wsMsg) {
            if (wsMsg.command.toLowerCase() === "playerconfig") {
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
                    populateCardListTableHeaders();
                }
            }
        });
    };
    
    /**
     * Update the display of current, min and max cards in deck on the page.
     * @returns {undefined}
     */
    const updateDeckCardSummary = function() {
        const cardSummary = `Cards: ${deckData.currentSize} / min: ${deckData.minSize}, max: ${deckData.maxSize}`;
        deckBuilderCardsSelected.innerHTML = cardSummary;
    };
    
    /**
     * Dynamically create the table headers for displaying cards of a mod, 
     * based on `modColumns` object
     * @returns {undefined}
     */
    const populateCardListTableHeaders = function() {
        // Headers
        const currentMod = localStorage.getItem("modName");
        const currentModColumns = modColumns[currentMod];
        const numColumns = currentModColumns.length;
        let gridTemplateColumns = "";
        // concatenate widths together in a string for `grid-template-columns` property
        for (let i = 0; i < numColumns; i++) {
            gridTemplateColumns += currentModColumns[i].width + " ";
        }
        deckBuilderCardListTable.style.gridTemplateColumns = gridTemplateColumns.trim();
        // make the actual headers
        for (let i = 0; i < numColumns; i++) {
            const header = document.createElement("div");
            header.className = "deckBuilderCardListHeader";
            header.innerHTML = currentModColumns[i].displayName;
            for (let prop in currentModColumns[i].cssProperties) {
                header.style.setProperty(prop, currentModColumns[i].cssProperties[prop]);
            }
            deckBuilderCardListTable.appendChild(header);
        }
    };

    /**
     * IIFE to control the deck builder.
     * @type undefined
     * @returns {undefined}
     */
    const runDeckBuilderController = function() {
        logDebugMessage("deckBuilderController called");
        handleWebSocketConnection();
    }();
};