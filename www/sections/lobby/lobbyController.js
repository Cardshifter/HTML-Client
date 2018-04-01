/* global CardshifterServerAPI */

"use strict";

const lobbyController = function() {
    const currentUser = localStorage.getItem("username");
    const onlineUsers = [];
    const invite = {
        id: null,
        username: null,
        mod: null
    };
    const gotInvite = false;
    
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
            const userNum = `user${i}`;
            const usernameSelect = document.createElement("input");
            usernameSelect.type = "radio";
            usernameSelect.id = userNum;
            usernameSelect.name = "select_username";
            usernameSelect.value = username;
            if (username === currentUser) {
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
    
    const renderInvite = function() {
        const inviteRequestContainer = document.getElementById("lobby_invite_request");
        inviteRequestContainer.style.display = "block";
        const lobbyInvite = document.getElementById("lobby_invite");
        lobbyInvite.innerHTML = `Game invite from ${invite.username} to play ${invite.mod}!`;
        const acceptBtn = document.createElement("input");
        acceptBtn.type = "button";
        acceptBtn.id = "lobby_invite_accept";
        acceptBtn.value ="Accept";
        acceptBtn.className = "btn btn-success";
        const declineBtn = document.createElement("input");
        declineBtn.type = "button";
        declineBtn.id = "lobby_invite_decline";
        declineBtn.value ="Decline";
        declineBtn.className = "btn btn-warning";
        lobbyInvite.appendChild(acceptBtn);
        lobbyInvite.appendChild(declineBtn);
    };
    
    /**
     * Renders the available mods list.
     * @returns {undefined}
     */
    const renderAvailableMods = function() {
        const mods = document.getElementById("lobby_mod_selection");
        for (let i = 0; i < global.availableMods.length; i++) {
            const modContainer = document.createElement("span");
            modContainer.className = "lobbyMod";
            const modName = global.availableMods[i];
            const modNum = `mod${i}`;
            const modSelect = document.createElement("input");
            modSelect.type = "radio";
            modSelect.id = modNum;
            modSelect.name = "select_mod";
            modSelect.value = modName;
            modSelect.onclick = function() {
                localStorage.setItem("selectMod", modName);
            };
            const modLabel = document.createElement("label");
            modLabel.for = modNum;
            modLabel.innerHTML = modName;
            modContainer.appendChild(modSelect);
            modContainer.appendChild(modLabel);
            mods.appendChild(modContainer);
        }
    };
    
    /**
     * Handles interactions between the browser client and the game server.
     * @returns {undefined}
     */
    const handleWebSocketConnection = function() {
        const CHAT_FEED_LIMIT = 10;
        const ENTER_KEY = 13;
        const MESSAGE_DELAY = 3000;

        let getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
        CardshifterServerAPI.sendMessage(getUsers);
        
        CardshifterServerAPI.setMessageListener(function(wsMsg) {
            updateUserList(wsMsg);
            addChatMessage(wsMsg);
            receiveInvite(wsMsg);
        });
        
        /**
         * Updates the onlineUsers list based on `userstatus` messages from game server.
         * @param {Object} wsMsg - WebSocket message
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
         * @param {Object} wsMsg - WebSocket message
         * @returns {undefined}
         * @example {"command":"chat","chatId":1,"message":"Hello","from":"Phrancis"}
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
        
        /**
         * 
         * @param {OObject} wsMsg - WebSocket message
         * @returns {undefined}
         * @example {"command":"inviteRequest","id":1,"name":"HelloWorld","gameType":"Mythos"}
         */
        const receiveInvite = function(wsMsg) {
            if (wsMsg.command === "inviteRequest") {
                logDebugMessage(`SERVER inviteRequest message: ${JSON.stringify(wsMsg)}`);
                invite.id = wsMsg.id;
                invite.username = wsMsg.name;
                invite.mod = wsMsg.gameType;
                renderInvite();
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
        renderAvailableMods();
    }();
};