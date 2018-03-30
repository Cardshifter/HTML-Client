/* global CardshifterServerAPI */

"use strict";

const lobbyController = function() {
    const GLOBAL_USERS = [];
    const userDisplay = document.getElementById("lobby_users");
    
    /**
     * Adds a user to the GLOBAL_USERS list.
     * @param {string} username
     * @returns {undefined}
     */
    const addToGlobalUserList = function(username) {
        if (!GLOBAL_USERS.includes(username)) {
            GLOBAL_USERS.push(username);
            GLOBAL_USERS.sort();
        }
        logDebugMessage(`GLOBAL_USERS: [${GLOBAL_USERS}]`);
        renderUserList();
    };
    
    /**
     * Removes a user from the GLOBAL_USERS list.
     * @param {string} username
     * @returns {undefined}
     */
    const removeFromGlobalUserList = function(username) {
        if (GLOBAL_USERS.includes(username)) {
            for (let i = 0; i < GLOBAL_USERS.length; i++) {
                if (GLOBAL_USERS[i] === username) {
                    GLOBAL_USERS.splice(i, 1);
                }
            }
        }
    };
    
    /**
     * Renders the user list on the page based on the content of GLOBAL_USERS.
     * @returns {undefined}
     */
    const renderUserList = function() {
        userDisplay.innerHTML = "";
        for (let i = 0; i < GLOBAL_USERS.length; i++) {
            const user = document.createElement("li");
            user.innerHTML = GLOBAL_USERS[i];
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
        
        let getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("GLOBAL_USERS", "");
        CardshifterServerAPI.sendMessage(getUsers);
        
        CardshifterServerAPI.setMessageListener(function(message) {
            updateUserList(message);
        });
        
        /**
         * Updates the GLOBAL_USERS list based on `userstatus` messages from game server.
         * @param {Object} message
         * @returns {undefined}
         * @example message - {command: "userstatus", userId: 2, status: "ONLINE", name: "AI Loser"}
         */
        const updateUserList = function(message) {
            if (message.command === "userstatus") {
                logDebugMessage(`SERVER userstatus message: ${JSON.stringify(message)}`);
                if (message.status === "ONLINE") {
                    addToGlobalUserList(message.name);
                }
                else if (message.status ==="OFFLINE") {
                    removeFromGlobalUserList(message.name);
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