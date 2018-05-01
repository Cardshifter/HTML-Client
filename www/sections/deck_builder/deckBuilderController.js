/* global CardshifterServerAPI, populateCardListTableHeaders */

"use strict";

const modColumns = {
    "Cyborg-Chronicles" : [
        {
            id : "creatureType",
            displayName : "Creature Type",
            width : "1fr"
        },
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
            id : "scrapValueCost",
            displayName : "Scrap Value/Cost",
            width : "1fr"
        },
        {
            id : "taunt",
            displayName : "Taunt",
            width : "1fr"
        },
        {
            id : "sickness",
            displayName : "Sickness Turns",
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
    ],
    "Mythos" : [
        {
            id : "creatureType",
            displayName : "Creature Type",
            width : "1fr"
        },
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
            id : "manaUpkeep",
            displayName : "Mana Upkeep",
            width : "1fr"
        },
        {
            id : "taunt",
            displayName : "Taunt",
            width : "1fr"
        },
        {
            id : "sickness",
            displayName : "Sickness Turns",
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
    // TODO include in implementation: currentDeck[cardId].cardCount
    let currentDeck = {};
    
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
                    populateCardListTableHeaders(localStorage.getItem("modName"))
                    .then(function(result) {
                        logDebugMessage(result);
                        populateCardListRows();
                    });
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
     * @@param {string} modName - the name of the current mod 
     * @returns {undefined}
     */
    const populateCardListTableHeaders = function(modName) {
        return new Promise(function(resolve, reject) {
            const currentModColumns = modColumns[modName];
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
            // verify that cound of actual headers in DOM matches what is expected
            if (deckBuilderCardListTable.childElementCount === numColumns) {
                resolve("Mod columns populated");
            } else {
                reject(Error("Mod columns failed to populate"));
            }
        });
    };
    
    /**
     * Populate the grid with card data.
     * TODO fix server side encoding so that fixEncoding() calls are not needed to display text properly.
     * @returns {undefined}
     */
    const populateCardListRows = function() {
        const columns = [];
        const currentModColumns = modColumns[localStorage.getItem("modName")];
        // Get a list of all the column IDs for the current mod.
        for (let i = 0; i < currentModColumns.length; i++) {
            columns.push(currentModColumns[i].id);
        }
        const cards = deckData.cardData;
        // Iterate cards and populate the values in the grid's respective columns, in the correct column order.
        for (let id in cards) {
            let card = cards[id].properties;
            logDebugMessage(JSON.stringify(card));
            for (let i = 0; i < columns.length; i++) {
                const cell = document.createElement("div");
                cell.className = "deckBuilderCardListCell";
                switch(columns[i]) {
                    case "creatureType":
                        let creatureType = card["creatureType"];
                        creatureType = creatureType ? fixEncoding(creatureType) : "-";
                        cell.innerHTML = creatureType;
                        break;
                    case "name":
                        let name = card["name"];
                        name = name ? fixEncoding(name) : "-";
                        cell.innerHTML = name;
                        break;
                    case "count":
                        // TODO increment/decrement buttons
                        let currentCardCount;
                        try {
                            currentCardCount = currentDeck[id].cardCount;
                        } catch(err) {
                            currentCardCount = 0;
                        }
                        const cardMax = deckData.cardsWithMax[card["id"]] || deckData.maxPerCard;
                        cell.style.textAlign = "center";
                        cell.innerHTML = `${currentCardCount} / ${cardMax}`;
                        break;
                    case "manaCost":
                        cell.innerHTML = card["MANA_COST"] || "-";
                        break;
                    case "attackHealth":
                        let attack = card["ATTACK"] || "-";
                        let health = card["HEALTH"] || "-";
                        cell.innerHTML = `${attack} / ${health}`;
                        break;
                    case "manaUpkeep":
                        cell.innerHtml = card["MANA_UPKEEP"] || "-";
                        break;
                    case "scrapValueCost":
                        let scrapValue = card["SCRAP"] || "-";
                        let scrapCost = card["SCRAP_COST"] || "-";
                        cell.innerHTML = `${scrapValue} / ${scrapCost}`;
                        break;
                    case "taunt":
                        cell.innerHTML = card["TAUNT"] ? "Yes" : "-";
                        break;
                    case "sickness":
                        cell.innerHTML = `${card["SICKNESS"]}` || "-";
                        break;
                    case "canAttack":
                        let canAttack = card["ATTACK_AVAILABLE"] === 1 ? "Yes" : "No";
                        if (canAttack !== "Yes") { cell.style.color = "red"; }
                        cell.innerHTML = canAttack;
                        break;
                    case "effect":
                        let effect = card["effect"];
                        effect = effect ? fixEncoding(effect) : "-";
                        cell.innerHTML = effect;
                        break;
                    case "flavor":
                        let flavor = card["flavor"];
                        flavor = flavor ? fixEncoding(flavor) : "-";
                        cell.innerHTML = flavor;
                        break;
                    default:
                        cell.innerHTML = "";
                }
                deckBuilderCardListTable.appendChild(cell);
            }
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