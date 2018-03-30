/* global from */

"use strict";

/**
 * Checks if the string begins with wss://
 * Note that WSS is currently not supported by the game server, see this issue:
 * https://github.com/Cardshifter/Cardshifter/issues/442
 * @type RegExp
 */
const wssProtocolFinder = /^wss?:\/\//;

/*
 * Enum for WebSocket ready state constants.
 * @enum {number}
 */
const readyStates = {
    CONNECTING : 0,
    OPEN : 1,
    CLOSING : 2,
    CLOSED : 3
};

const MAIN_LOBBY = 1;

let eventTypes = [];

/**
* The base class Message for all the other message types
* to inherit from.
*
* TODO: Would it just be easier to set the `.command` property
* individually for each card type?
* 
* @param {string} command - The command of the message.
*/
const Message = function(command) {
    this.command = command;
};

/**
* The exception that is thrown when the code is trying to
* interact with the API when the API has not been
* initialized with `.init` yet.
* 
* @param {string} message - Informational message about the exception.
*/
const NotInitializedException = function(message) {
    this.name = "NotInitializedException";
    this.message = message || "";
};

/**
* The exception that is thrown when the code is telling the
* API to interact with the socket when the socket is not
* ready to accept any information.
* 
* @param {string} message - Informational message about the exception.
* @param {number} readyState - Ready state constant from WebSocket API, https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/
const SocketNotReadyException = function(message, readyState) {
    this.name = "SocketNotReadyException";
    this.message = message || "";
    this.readyState = readyState;
};

/*
 * Returns all the keys of an object and its inherited keys.
 * This is used so `JSON.stringify` can get the `.command` of a message.
 * 
 * @param {Object} obj - The object to flatten
 * @return {Object} - a new Object, containing obj's keys and inherited keys
 * @source https://stackoverflow.com/a/8779466/3626537
*/
const flatten = function(obj) {
    let result = Object.create(obj);
    for(let key in result) {
        // This assignment seems weird, but see the StackOverflow source for explanation.
        result[key] = result[key];
    }
    return result;
};

/*
 * Singleton object to handle communication via WebSocket between the client
 * and the game server.
 */
const CardshifterServerAPI = {
    socket: null,
    messageTypes: {
        /*
         * Incoming login message.
         * A login message from a client to add a user to the available users on the server.
         * This login message is required before any other action or message can be performed between a client and a server.
         * @constructor
         * @param {string} username - The incoming user name passed from client to server, not null
         * @example Message: <code>{ "command":"login","username":"JohnDoe" }</code>
         */
        LoginMessage : function(username) {
            this.username = username;
        },
        
        /*
         * Request available targets for a specific action to be performed by an entity.
         * These in-game messages request a list of all available targets for a given action and entity.
         * The client uses this request in order to point out targets (hopefully with a visual aid such as highlighting targets)
         * that an entity (such as a creature card, or a player) can perform an action on (for example attack or enchant a card).
         * @constructor
         * @param {number} gameId - The Id of this game currently being played
         * @param {number} id - The Id of this entity which requests to perform an action
         * @param {string} action - The name of this action requested to be performed
         */
        RequestTargetsMessage : function(gameId, id, action) {
            this.gameId = gameId;
            this.id = id;
            this.action = action;
        },
        
        /*
         * Make a specific type of request to the server.
         * This is used to request an action from the server which requires server-side information.
         * @constructor
         * @param {string} request - This request
         * @param {string} message - The message accompanying this request
         */
        ServerQueryMessage : function(request, message) {
            this.request = request;
            this.message = message;

            this.toString = function() {
                return `ServerQueryMessage: Request ${this.request} message: ${this.message}`;
            };
        },


        /*
         * Request to start a new game.
         * This is sent from the Client to the Server when this player invites another player (including AI) 
         * to start a new game of a chosen type.
         * @constructor
         * @param opponent - The Id of the player entity being invited by this player
         * @param gameType - The type / mod of the game chosen by this player
         */
        StartGameRequest : function(opponent, gameType) {
            this.opponent = opponent;
            this.gameType = gameType;
        },

        /*
         * Serialize message from JSON to byte.
         * Primarily used for libGDX client.
         * Constructor.
         * @param type - This message type
         */
        TransformerMessage : function(type) {
            this.type = type;
        },

        /*
         * Message for a game entity to use a certain ability.
         * Game entities (e.g., cards, players) may have one or more ability actions that they can perform.
         * Certain abilities can have multiple targets, hence the use of an array.
         * @constructor
         * Used for multiple target actions.
         *
         * @param gameId - This current game
         * @param entity - This game entity performing an action
         * @param action - This action
         * @param targets - The set of multiple targets affected by this action
         */
        UseAbilityMessage : function(gameId, id, action, targets) {
            this.gameId = gameId;
            this.id = id;
            this.action = action;
            this.targets = targets;

            this.toString = function() {
                return ``
                    + `UseAbilityMessage`
                    + `[id=${this.id},`
                    + `action=${this.action},`
                    + `gameId=${this.gameId}`
                    + `targets=${this.targets.toString()}]`
                ;
            };
        },

        /*
         * Chat message in game lobby.
         * These are messages printed to the game lobby which are visible to all users present at the time the message is posted.
         * @constructor
         * @param {string} message - The content of this chat message
         */
        ChatMessage : function(message) {
            this.chatId = MAIN_LOBBY;
            this.message = message;
            this.from = localStorage.getItem("username");

            this.toString = function() {
                return `ChatMessage [chatId=${this.chatId}, message=${this.message}, from=${this.from}]`;
            };
        },

        /*
         * Request to invite a player to start a new game.
         * @constructor
         * @param id - The Id of this invite request
         * @param {string} name - The name of the player being invited
         * @param gameType - The game type of this invite request
         */
        InviteRequest : function(id, name, gameType) {
            this.id = id;
            this.name = name;
            this.gameType = gameType;
        },

        /*
         * Response to an InviteRequest message.
         * @constructor
         * @param inviteId - Id of this incoming InviteRequest message
         * @param {boolean} accepted - Whether or not the InviteRequest is accepted
         */
        InviteResponse : function(inviteId, accepted) {
            this.inviteId = inviteId;
            this.accepted = accepted;
        },

        /*
         * Player configuration for a given game.
         * @constructor
         * @param gameId - This game
         * @param {string} modName - The mod name for this game
         * @param {Map} configs - Map of player name and applicable player configuration
         */
        PlayerConfigMessage : function(gameId, modName, configs) {
            this.gameId = gameId;
            this.modName = modName;
            this.configs = configs;

            this.toString = function() {
                return ``
                    + `PlayerConfigMessage{`
                    + `configs=${configs}, `
                    + `gameId=${gameId}, `
                    + `modName='${modName}'`
                    + `}`
                ;
            };
        }
    },
    /*
     * Initializes the API for use.
     *
     * This sets up all the message types to inherit the main `Message` class, and sets
     * up the websocket that will be used to communicate to the server, and to recieve
     * information from the server.
     * 
     * @param {string} server - The server address to connect to
     * @param {boolean} isSecure - Whether to use SSL for the connection (NOT IMPLEMENTED)
     * @param onReady - Function to assign to `socket.onopen`
     * @param onError - Function to assign to `socket.onerror`
     */
    init : function(server, isSecure, onReady, onError) {
        let types = this.messageTypes;
        types.LoginMessage.prototype = new Message("login");
        types.RequestTargetsMessage.prototype = new Message("requestTargets");
        types.ServerQueryMessage.prototype = new Message("query");
        types.StartGameRequest.prototype = new Message("startgame");
        types.TransformerMessage.prototype = new Message("serial");
        types.UseAbilityMessage.prototype = new Message("use");
        types.ChatMessage.prototype = new Message("chat");
        types.InviteRequest.prototype = new Message("inviteRequest");
        types.InviteResponse.prototype = new Message("inviteResponse");
        types.PlayerConfigMessage.prototype = new Message("playerconfig");
        NotInitializedException.prototype = new Error();
        SocketNotReadyException.prototype = new Error();

         // secure websocket is wss://, rather than ws://
        const secureAddon = (isSecure ? "s" : "");
         // if the protocol is not found in the string, store the correct protocol (is secure?)
         // Note that this is not supported by the game server at the moment, see issue:
         // https://github.com/Cardshifter/Cardshifter/issues/442
        const protocolAddon = (wssProtocolFinder.test(server) ? "" : `ws${secureAddon}://`);

        let socket = new WebSocket(protocolAddon + server);

        socket.onopen = onReady;

        socket.onerror = function() {
            onError();
            this.socket = null;
        };

        this.socket = socket;
    },

    /**
    * Sends a message to the server
    *
    * @param {Object} message - The message to send
    * @error SocketNotReadyException - The socket is not ready to be used
    * @error NotInitializedException - The API has not yet been initialized
    */
    sendMessage : function(message) {
        const socket = this.socket;
        if (socket) {
            if (socket.readyState === readyStates.OPEN) {
                this.socket.send(JSON.stringify(flatten(message)));
            } 
            else {
                throw new SocketNotReadyException("The Websocket is not ready to be used.", socket.readyState);
            }
        } 
        else {
            throw new NotInitializedException("The API has not yet been initialized.");
        }
    },

    /**
    * Sets an event listener for when the server sends a message and
    * the message type is one of the types in types
    *
    * @param listener - The function to fire when a message of types is received
    * @param {string[]} types - (OPTIONAL) Only fire the listener when the message type is in this array
    * @param {Object} timeout - (OPTIONAL) The function(.ontimeout) to call after MS(.ms) of no reply
    *
    * TODO: Maybe a timeout will be needed? Pass in a function and a MS count.
    */
    setMessageListener : function(listener, types, timeout) {
        eventTypes = types;

        this.socket.onmessage = function(message) {
            const data = JSON.parse(message.data);
            if (eventTypes) {
                if(eventTypes.includes(data.command) !== -1) { // if contains
                    listener(data);
                }
            } 
            else {
                listener(data);
            }
        };
    },

    /**
    * Adds types to the types to listen for in the message event listener
    *
    * @param {string[]} types - The types to add
    */
    addEventTypes : function(types) {
        eventTypes = eventTypes.concat(types);
    },

    /**
    * Removes the message event listener
    */
    removeMessageListener : function() {
        this.socket.onmessage = null;
    }
};