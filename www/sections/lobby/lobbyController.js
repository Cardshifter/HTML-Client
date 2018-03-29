/* global CardshifterServerAPI */

"use strict";

const lobbyController = function() {
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
        logDebugMessage(`getUsers: ${getUsers}`);
        
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