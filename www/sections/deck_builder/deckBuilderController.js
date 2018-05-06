/* global CardshifterServerAPI, populateCardListTableHeaders, fixEncoding, removeAllNewlines */

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
    
    let savedDecks = [];
    
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
     * Populates saved decks both from a preloaded JSON file and fromuser-saved decks in localStorage.
     * @returns {undefined}
     */
    const populateSavedDecks = function() {
        logDebugMessage("populateSavedDecks called");
        const currentMod = localStorage.getItem("modName");
        const preloadedDecksPath = "sections/deck_builder/preloaded_decks.json";
        $.getJSON(preloadedDecksPath, function(jsonData) {
            logDebugMessage(`$.getJSON called with path ${preloadedDecksPath}`);
            $.each(jsonData, function(_, jsonPreloadedDecksArray) {
                for (let i = 0; i < jsonPreloadedDecksArray.length; i++) {
                    if (jsonPreloadedDecksArray[i].mod === currentMod) {
                        jsonPreloadedDecksArray[i]["preloaded"] = true;
                        savedDecks.push(jsonPreloadedDecksArray[i]);
                    }
                }
            });
        });
        // TODO add local saved decks
        // TODO add display logic
        console.log(savedDecks);
    };
    
    /**
     * Update the display of current, min and max cards in deck on the page.
     * @returns {undefined}
     */
    const updateDeckCardSummary = function() {
        const currentSize = countCurrentChosenCards();
        deckData.currentSize = currentSize;
        const cardSummary = `Cards: ${deckData.currentSize} / min: ${deckData.minSize}, max: ${deckData.maxSize}`;
        deckBuilderCardsSelected.innerHTML = cardSummary;
    };
    
    /**
     * Counts how many cards are currently chosen in the deck.
     * @returns {Number}
     */
    const countCurrentChosenCards = function() {
        let count = 0;
        const chosenCards = deckData.chosen;
        for (let cardId in chosenCards) {
            count += chosenCards[cardId];
        }
        return count;
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
            // verify that count of actual headers in DOM matches what is expected
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
        /**
         * Iterate cards and populate the values in the grid's respective columns, in the correct column order.
         */
        for (let id in cards) {
            let card = cards[id].properties;
            //logDebugMessage(JSON.stringify(card));
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
                        const cardCountContainerSpan = document.createElement("span");
                        cardCountContainerSpan.className = "deckBuilderCardCountContainerSpan";
                        
                        const currentCardCount = deckData.chosen[id] || 0;
                        const currentCardCountSpan = document.createElement("span");
                        currentCardCountSpan.id = `card${id}Count`;
                        currentCardCountSpan.innerHTML = currentCardCount;
                        
                        const maxCardCount = deckData.cardsWithMax[card["id"]] || deckData.maxPerCard;
                        const maxCardCountSpan = document.createElement("span");
                        maxCardCountSpan.id = `card${id}Max`;
                        maxCardCountSpan.innerHTML = maxCardCount;

                        const separatorSpan = document.createElement("span");
                        separatorSpan.innerHTML = " / ";
                        
                        cardCountContainerSpan.appendChild(currentCardCountSpan);
                        cardCountContainerSpan.appendChild(separatorSpan);
                        cardCountContainerSpan.appendChild(maxCardCountSpan);
                        
                        const addBtn = document.createElement("button");
                        addBtn.className = "btn btn-sm btn-success";
                        addBtn.style.marginLeft = "5px";
                        addBtn.innerHTML = "+";
                        addBtn.onclick = function() { 
                            addCardToDeck(id);
                        };
                        
                        const subBtn = document.createElement("button");
                        subBtn.className = "btn btn-sm btn-warning";
                        subBtn.style.marginRight = "5px";
                        subBtn.innerHTML = "-";
                        subBtn.onclick = function() { 
                            subtractCardFromDeck(id); 
                        };
                        
                        cell.appendChild(subBtn);
                        cell.appendChild(cardCountContainerSpan);
                        cell.appendChild(addBtn);
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
                        cell.innerHTML = card["MANA_UPKEEP"] || "-";
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
                        if (!effect) {
                            cell.innerHTML = "-";
                        }
                        else {
                            // TODO the formatting of effect should really be fixed on the server, this removeAllNewlines sort of works OK though.
                            effect = removeAllNewlines(fixEncoding(effect), ". ");
                            const btn = document.createElement("button");
                            btn.id = `card${id}Fx`;
                            btn.title = card["name"];
                            btn.className = "btn btn-sm";
                            btn.setAttribute("data-toggle", "popover");
                            btn.setAttribute("data-placement", "top");
                            btn.setAttribute("data-content", effect);
                            btn.innerHTML = "FX";
                            cell.appendChild(btn);
                        }
                        break;
                    case "flavor":
                        let flavor = card["flavor"];
                        if (!flavor) {
                            cell.innerHTML = "-";
                        }
                        else {
                            flavor = removeAllNewlines(fixEncoding(flavor));
                            const btn = document.createElement("button");
                            btn.id = `card${id}Flavor`;
                            btn.title = card["name"];
                            btn.className = "btn btn-sm";
                            btn.setAttribute("data-toggle", "popover");
                            btn.setAttribute("data-placement", "top");
                            btn.setAttribute("data-content", flavor);
                            btn.innerHTML = "?";
                            cell.appendChild(btn);
                        }
                        break;
                    default:
                        cell.innerHTML = "";
                }
                deckBuilderCardListTable.appendChild(cell);
            }
        }
        // jQuery needed for Bootstrap popover
        $('[data-toggle="popover"]').popover();
    };
    
    /**
     * Adds a card to the deck, if possible, and update GUI accordingly.
     * @param {number} cardId - the ID of the card to add
     * @returns {undefined}
     */
    const addCardToDeck = function(cardId) {
        logDebugMessage(`addCardToDeck(${cardId})`);
        const currentCardCount = deckData.chosen[cardId] || 0;
        const maxCardCount = deckData.cardsWithMax[cardId] || deckData.maxPerCard;
        if (currentCardCount === maxCardCount) {
            logDebugMessage(`There are already ${currentCardCount} / ${maxCardCount} of card ${cardId}`);
        }
        else if (deckData.currentSize === deckData.maxSize) {
            logDebugMessage(`The max deck size of ${deckData.maxSize} has already been reached`);
        }
        else {
            if (currentCardCount === 0) {
                deckData.chosen[cardId] = 1;
            }
            else {
                deckData.chosen[cardId]++;
            }
            document.getElementById(`card${cardId}Count`).innerHTML = deckData.chosen[cardId];
            logDebugMessage(`Card ${cardId} : ${deckData.chosen[cardId]} / ${maxCardCount}`);
        }
        updateDeckCardSummary();
        logDebugMessage(`Current chose cards: ${JSON.stringify(deckData.chosen)}`);
    };
    
    /**
     * Subtracts a card from the deck, if possible, and update GUI accordingly.
     * @param {number} cardId - the ID of the card to subtract
     * @returns {undefined}
     */
    const subtractCardFromDeck = function(cardId) {
        logDebugMessage(`subtractCardFromDeck(${cardId})`);
        const currentCardCount = deckData.chosen[cardId] || 0;
        const maxCardCount = deckData.cardsWithMax[cardId] || deckData.maxPerCard;
        if (currentCardCount === 0) {
            logDebugMessage(`Count of card ${cardId} is already 0`);
        }
        else {
            deckData.chosen[cardId]--;
            document.getElementById(`card${cardId}Count`).innerHTML = deckData.chosen[cardId];
            logDebugMessage(`Card ${cardId} : ${deckData.chosen[cardId]} / ${maxCardCount}`);
        }
        updateDeckCardSummary();
        logDebugMessage(`Current chose cards: ${JSON.stringify(deckData.chosen)}`);
    };

    /**
     * IIFE to control the deck builder.
     * @type undefined
     * @returns {undefined}
     */
    const runDeckBuilderController = function() {
        logDebugMessage("deckBuilderController called");
        populateSavedDecks();
        handleWebSocketConnection();
    }();
};