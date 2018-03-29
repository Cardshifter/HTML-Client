/* global CardshifterServerAPI */

"use strict";

const lobbyController = function() {
    const USERS = [];
    const userDisplay = document.getElementById("lobby_users");
    
    const updateGlobalUserList = function(username) {
        if (!USERS.includes(username)) {
            USERS.push(username);
            USERS.sort();
        }
        logDebugMessage(`USERS: [${USERS}]`);
        userDisplay.innerHTML = "";
        for (let i = 0; i < USERS.length; i++) {
            const user = document.createElement("li");
            user.innerHTML = USERS[i];
            userDisplay.appendChild(user);
        }
    };
    
    const handleWebSocketConnection = function() {
        const CHAT_FEED_LIMIT = 10;
        const ENTER_KEY = 13;
        const MESSAGE_DELAY = 3000;
        
        const users = [];
        const chatMessages = [];
        let mods = window.availableGameMods || [];
        const currentUser = localStorage.getItem("username");
        const invite = {
            id : null,
            name : null,
            type : null
        };
        let gotInvite = false;
        
        // will be set by either startGame or acceptInvite
        let gameMod = "";
        
        let ping = document.getElementById("ping");
        
        const commandMap = {
//            "userstatus": updateUserList,
//            "chat": addChatMessage,
//            "inviteRequest": displayInvite,
//            "availableMods": displayMods,
//            "newgame": enterNewGame
        };
        
        let getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
        CardshifterServerAPI.sendMessage(getUsers);
        
        CardshifterServerAPI.setMessageListener(function(message) {
            updateUserList(message);
        });
        
        /**
         * 
         * @param {type} message
         * @returns {undefined}
         * @example message - {command: "userstatus", userId: 2, status: "ONLINE", name: "AI Loser"}
         */
        const updateUserList = function(message) {
            if (message.command === "userstatus") {
                logDebugMessage(`SERVER userstatus message: ${JSON.stringify(message)}`);
                if (message.status === "ONLINE") {
                    updateGlobalUserList(message.name);
                }
            }
        };
        
    };
    
    
    /**
     * IIFE to control the lobby.
     * @type undefined
     */
    const runLobbyController = function() {
        logDebugMessage("lobbyController called");
        handleWebSocketConnection();
    }();
};