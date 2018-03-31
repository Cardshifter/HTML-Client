/* global CardshifterServerAPI */

"use strict";

const lobbyController = function() {
    const onlineUsers = [];
    
    const userDisplay = document.getElementById("lobby_users");
    const chatInput = document.getElementById("lobby_chat_text_area");
    const chatSendButton = document.getElementById("lobby_chat_message_send");
    const chatMessageList = document.getElementById("lobby_chat_messages");
    
    /**
     * Adds a user to the onlineUsers list.
     * @param {string} username
     * @returns {undefined}
     */
    const addToGlobalUserList = function(username) {
        if (!onlineUsers.includes(username)) {
            onlineUsers.push(username);
            onlineUsers.sort();
        }
        renderUserList();
    };
    
    /**
     * Removes a user from the onlineUsers list.
     * @param {string} username
     * @returns {undefined}
     */
    const removeFromGlobalUserList = function(username) {
        if (onlineUsers.includes(username)) {
            for (let i = 0; i < onlineUsers.length; i++) {
                if (onlineUsers[i] === username) {
                    onlineUsers.splice(i, 1);
                }
            }
            onlineUsers.sort();
            renderUserList();
        }
    };
    
    /**
     * Renders the user list on the page based on the content of onlineUsers.
     * @returns {undefined}
     */
    const renderUserList = function() {
        userDisplay.innerHTML = "";
        for (let i = 0; i < onlineUsers.length; i++) {
            const usernameContainer = document.createElement("div");
            usernameContainer.className = "lobbyUser";
            const username = onlineUsers[i];
            const userNum = "user${i}";
            const usernameSelect = document.createElement("input");
            usernameSelect.type = "radio";
            usernameSelect.id = userNum;
            usernameSelect.name = "select_username";
            usernameSelect.value = username;
            if (username === localStorage.getItem("username")) {
                usernameSelect.disabled = true;
            }
            usernameSelect.onclick = function() {
                localStorage.setItem("selectedUsername", username);
            };
            const usernameLabel = document.createElement("label");
            usernameLabel.for = userNum;
            usernameLabel.innerHTML = username;
            usernameContainer.appendChild(usernameSelect);
            usernameContainer.appendChild(usernameLabel);
            userDisplay.appendChild(usernameContainer);
        }
    };
    
    const handleWebSocketConnection = function() {
        const CHAT_FEED_LIMIT = 10;
        const ENTER_KEY = 13;
        const MESSAGE_DELAY = 3000;
        
        const chatMessages = [];
        let mods = window.availableGameMods || [];
        const currentUser = localStorage.getItem("username");
        const invite = {
            id : null,
            name : null,
            type : null
        };        
        
        let getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
        CardshifterServerAPI.sendMessage(getUsers);
        
        CardshifterServerAPI.setMessageListener(function(message) {
            updateUserList(message);
            addChatMessage(message);
        });
        
        /**
         * Updates the onlineUsers list based on `userstatus` messages from game server.
         * @param {Object} message
         * @returns {undefined}
         * @example message - {command: "userstatus", userId: 2, status: "ONLINE", name: "AI Loser"}
         */
        const updateUserList = function(wsMsg) {
            if (wsMsg.command === "userstatus") {
                logDebugMessage(`SERVER userstatus message: ${JSON.stringify(wsMsg)}`);
                if (wsMsg.status === "ONLINE") {
                    addToGlobalUserList(wsMsg.name);
                }
                else if (wsMsg.status === "OFFLINE") {
                    removeFromGlobalUserList(wsMsg.name);
                    /**
                     * This condition is for circumventing an apparent server-side bug, see:
                     * https://github.com/Cardshifter/Cardshifter/issues/443
                     */
                    if (wsMsg.name) {
                        addChatMessage({
                            chatId: 1,
                            message: `${wsMsg.name} is now offline.`,
                            from: "Server Chat",
                            command: "chat"
                        });
                    }
                }
            }
        };
        
        /**
         * Adds chat message to the lobby on `chat` messages from game server.
         * @param {Object} wsMsg
         * @returns {undefined}
         */
        const addChatMessage = function(wsMsg) {
            if (wsMsg.command === "chat") {
                logDebugMessage(`SERVER chat message: ${JSON.stringify(wsMsg)}`);
                const now = new Date();
                const timeStamp = formatDate(now, "dd-MMM hh:mm");
                const msgText = `${timeStamp} | ${wsMsg.from}: ${wsMsg.message}`;
                const msgElem = document.createElement("li");
                msgElem.innerHTML = msgText;
                msgElem.className = "lobbyChatMessages lobbyChatMessage";
                chatMessageList.appendChild(msgElem);
            }
        };
        
        
    };
    
    /**
     * Handles the usage of the user chat textarea and send button. 
     * @returns {undefined}
     */
    const handleUserChatInput = function() {
        const enterKeyCode = 13;
        const newlineRegex = /\r?\n|\r/g;
        const postMessage = function() {
            const msg = chatInput.value.replace(newlineRegex, "");
            if (msg) {
                chatInput.value = null;
                sendChatMessage(msg);     
            }
        };
        chatInput.addEventListener("keyup", function(evt) {
            const code = evt.keyCode;
            if (code === enterKeyCode) {
                postMessage();
            }
        });
    };


    /**
     * Sends a chat message to the server.
     * @param {string} message
     * @returns {undefined}
     */
    const sendChatMessage = function(message) {
        const chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage(message);
        logDebugMessage(`sendChatMessage: ${chatMessage}`);
        CardshifterServerAPI.sendMessage(chatMessage);
    };
    
    
    /**
     * IIFE to control the lobby.
     * @type undefined
     */
    const runLobbyController = function() {
        logDebugMessage("lobbyController called");
        handleWebSocketConnection();
        handleUserChatInput();
    }();
};