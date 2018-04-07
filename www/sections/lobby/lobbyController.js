/* global CardshifterServerAPI, dynamicHtmlController */

"use strict";

/**
 * Adds a chat message to the lobby.
 * Note: Declaring outside IIFE so it can be called from other scripts.
 * @param {type} wsMsg - WebSocket message from server
 * @returns {undefined}
 */
let addChatMessage;

const lobbyController = function() {
    const currentUser = localStorage.getItem("username");
    const onlineUsers = [];
    const invite = {
        id: null,
        username: null,
        mod: null
    };
    
    const userDisplay = document.getElementById("lobby_users");
    const chatInput = document.getElementById("lobby_chat_text_area");
    const chatSendButton = document.getElementById("lobby_chat_message_send");
    const chatMessageList = document.getElementById("lobby_chat_messages");
    
    /**
     * Adds a user to the onlineUsers list.
     * @param {Object} user - The user object
     * @returns {undefined}
     */
    const addToOnlineUsersList = function(user) {
        if (!userIsOnline(user)) {
            onlineUsers.push(user);
            onlineUsers.sort();
        }
        renderUserList();
    };
    
    /**
     * Removes a user from the onlineUsers list.
     * @param {Object} user - The user object
     * @returns {undefined}
     */
    const removeFromOnlineUsersList = function(user) {
        if (userIsOnline(user)) {
            for (let i = 0; i < onlineUsers.length; i++) {
                if (onlineUsers[i].name === user.name) {
                    onlineUsers.splice(i, 1);
                }
            }
            renderUserList();
        }
    };
    
    /**
     * Checks whether the user exists in onlineUsers.
     * @param {Object} user
     * @returns {Boolean} - Whether the user exists
     */
    const userIsOnline = function(user) {
        const username = user.name;
        for (let i = 0; i < onlineUsers.length; i++) {
            /**
             * Note that the game server guarantees that duplicate usernames
             * cannot be used, hence no need to check for duplicates on client side.
             */
            if (onlineUsers[i].name === username) {
                return true;
            }
        }
        return false;
    };
    
    /**
     * Renders the user list on the page based on the content of onlineUsers.
     * @returns {undefined}
     */
    const renderUserList = function() {
        if (!userDisplay) {
            return;
        }
        userDisplay.innerHTML = "";
        for (let i = 0; i < onlineUsers.length; i++) {
            const username = onlineUsers[i].name;
            const userNum = `user${i}`;
            
            const usernameContainer = document.getElementById("userlist_entry_template").content.cloneNode(true);
            const usernameSelect = usernameContainer.querySelector("input");
            usernameSelect.id = userNum;
            usernameSelect.value = username;
            if (username === currentUser) {
                usernameSelect.disabled = true;
            }
            usernameSelect.onclick = function() {
                localStorage.setItem("selectedUsername", username);
            };
            const usernameLabel = usernameContainer.querySelector("label");
            usernameLabel.for = userNum;
            usernameLabel.innerHTML = username;            
            if (userDisplay) {
                userDisplay.appendChild(usernameContainer);
            }            
        }
    };
    
    /**
     * Displays a game invite near the top of the lobby.
     * @returns {undefined}
     */
    const renderInvite = function() {
        const inviteRequestContainer = document.getElementById("lobby_invite_request");
        inviteRequestContainer.style.display = "block";
        const lobbyInvite = document.getElementById("lobby_invite");
        const inviteMsg = lobbyInvite.querySelector("#lobby_invite_message");
        inviteMsg.innerHTML = `Game invite<br/>From: ${invite.username}<br/>Mod: ${invite.mod}!<br/>`;
        const acceptBtn = lobbyInvite.querySelector("#lobby_invite_accept");
        acceptBtn.onclick = function() {
            const acceptMsg = new CardshifterServerAPI.messageTypes.InviteResponse(invite.id, true);
            logDebugMessage(`Sent invite accept message: ${JSON.stringify(acceptMsg)}`);
            CardshifterServerAPI.sendMessage(acceptMsg);
            inviteRequestContainer.style.display = "none";
        };
        const declineBtn = lobbyInvite.querySelector("#lobby_invite_decline");
        declineBtn.onclick = function() {
            const declineMsg = new CardshifterServerAPI.messageTypes.InviteResponse(invite.id, false);
            logDebugMessage(`Sent invite decline message: ${JSON.stringify(declineMsg)}`);
            CardshifterServerAPI.sendMessage(declineMsg);
            inviteRequestContainer.style.display = "none";
        };
    };
    
    /**
     * Renders the available mods list.
     * @returns {undefined}
     */
    const renderAvailableMods = function() {
        const mods = document.getElementById("lobby_mod_selection");
        if (!mods) {
            return;
        }
        for (let i = 0; i < global.availableMods.length; i++) {
            const modName = global.availableMods[i];
            const modNum = `mod${i}`;
            
            const modContainer = document.getElementById("game_mod_template").content.cloneNode(true);
            const modSelect = modContainer.querySelector("input");
            modSelect.id = modNum;
            modSelect.value = modName;
            modSelect.onclick = function() {
                localStorage.setItem("selectedMod", modName);
            };
            const modLabel = modContainer.querySelector("label");
            modLabel.for = modNum;
            modLabel.innerHTML = modName;
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
            startGame(wsMsg);
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
                const user = {
                    id: wsMsg.userId,
                    name: wsMsg.name
                };
                if (wsMsg.status === "ONLINE") {
                    addToOnlineUsersList(user);
                }
                else if (wsMsg.status === "OFFLINE") {
                    removeFromOnlineUsersList(user);
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
        addChatMessage = function(wsMsg) {
            if (wsMsg.command === "chat") {
                logDebugMessage(`SERVER chat message: ${JSON.stringify(wsMsg)}`);
                const now = new Date();
                const timeStamp = formatDate(now, "dd-MMM hh:mm");
                const msgText = `${timeStamp} | ${wsMsg.from}: ${wsMsg.message}`;
                const msgElem = document.createElement("li");
                if (msgElem) {
                    msgElem.innerHTML = msgText;
                    msgElem.className = "lobbyChatMessages lobbyChatMessage";
                }                
                if (chatMessageList) {
                    chatMessageList.appendChild(msgElem);
                }
            }
        };
        
        /**
         * Fires rendering of invite requests on the page when an invite is received.
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
        
        /**
         * Load up deck builder when invite accepted and game starts
         * @param {type} wsMsg - WebSocket message
         * @returns {undefined}
         * @example {"command":"newgame","gameId":26,"playerIndex":1}
         */
        const startGame = function(wsMsg) {
            if (wsMsg.command === "newgame") {
                logDebugMessage(`SERVER newgame message: ${JSON.stringify(wsMsg)}`);
                dynamicHtmlController.unloadHtmlById("lobby");
                dynamicHtmlController.loadHtmlFromFile("deckBuilder", "sections/deck_builder/deck_builder.html")
                .then(function() {
                    deckBuilderController();
                });
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
        if (chatInput) {
            chatInput.addEventListener("keyup", function(evt) {
                const code = evt.keyCode;
                if (code === enterKeyCode) {
                    postMessage();
                }
            });
        }
        
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
    
    const activateInviteButon = function() {
        const lobbyInviteButton = document.getElementById("lobby_invite_button");
        if (lobbyInviteButton) {
            lobbyInviteButton.addEventListener("click", sendInvite);
        }
        
    };
    
    /**
     * Sends an invite to play to another user.
     * @returns {undefined}
     * @example {"command":"inviteRequest","id":15,"name":"HelloWorld","gameType":"Mythos"}
     */
    const sendInvite = function() {
        logDebugMessage("sendInvite called");
        const selectedUser = localStorage.getItem("selectedUsername");
        const selectedMod = localStorage.getItem("selectedMod");
        if (selectedUser === "null") {
            const msg = "Client error: You must select a user to be your opponent to invite them to a game.";
            addChatMessage({
                chatId: 1,
                message: msg,
                from: "NOTIFICATION",
                command: "chat"
            });
            logDebugMessage(msg);
        }
        else if (selectedMod === "null") {
            const msg = "Client error: You must select a mod to play with the opponent.";
            addChatMessage({
                chatId: 1,
                message: msg,
                from: "NOTIFICATION",
                command: "chat"
            });
            logDebugMessage(msg);
        }
        else {
            let selectedUsedId = null;
            for (let i = 0; i < onlineUsers.length; i++) {
                if (onlineUsers[i].name === selectedUser) {
                    selectedUsedId = onlineUsers[i].id;
                }
            }
            const inviteMsg = new CardshifterServerAPI.messageTypes.StartGameRequest(selectedUsedId, selectedMod);
            CardshifterServerAPI.sendMessage(inviteMsg);
        }
    };
    
    
    /**
     * IIFE to control the lobby.
     * @type undefined
     */
    const runLobbyController = function() {
        logDebugMessage("lobbyController called");
        localStorage.setItem("selectedUsername", null);
        localStorage.setItem("selectedMod", null);
        handleWebSocketConnection();
        handleUserChatInput();
        renderAvailableMods();
        activateInviteButon();
    }();
};