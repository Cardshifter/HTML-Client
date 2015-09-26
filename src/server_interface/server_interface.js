'use strict';

// checks if the string begins with either ws:// or wss://
var wsProtocolFinder = /ws(s)*:\/\//;
var SOCKET_OPEN = 1;

var MAIN_LOBBY = 1;

var eventTypes = [];

/**
* The base class Message for all the other message types
* to inherit from.
*
* TODO: Would it just be easier to set the .command property
* individually for each card type?
*/
function Message(command) {
    this.command = command;
}

/**
* The exception that is thrown when the code is trying to
* interact with the API when the API has not been
* initialized with .init yet.
*/
function NotInitializedException(message) {
    this.name = "NotInitializedException";
    this.message = message;
}

/**
* The exception that is thrown when the code is telling the
* API to interact with the socket when the socket is not
* ready to accept any information.
*/
function SocketNotReadyException(message, readyState) {
    this.name = "SocketNotReadyException"
    this.message = message;
    this.readyState = readyState;
}

/**
    Returns all the keys of obj and it's inherited keys

    @param obj:Object -- The object
    @return Object -- a new Object, containing obj's keys and inherited keys
    @source http://stackoverflow.com/questions/8779249/how-to-stringify-inherited-objects-to-json

    This is used so JSON.stringify can get the .command of a message.
*/
function flatten(obj) {
    var result = Object.create(obj);
    for(var key in result) {
        result[key] = result[key];
    }
    return result;
}

var CardshifterServerAPI = {
    socket: null,
    messageTypes: {
        /**
        * Incoming login message.
        * <p>
        * A login message from a client to add a user to the available users on the server.
        * This login message is required before any other action or message can be performed between a client and a server.
        * @constructor
        * @param username  the incoming user name passed from client to server, not null
        * @example Message: <code>{ "command":"login","username":"JohnDoe" }</code>
        */
        LoginMessage: function(username) {
            this.username = username;
        },

        /**
        * Request available targets for a specific action to be performed by an entity.
        * <p>
        * These in-game messages request a list of al available targets for a given action and entity.
        * The client uses this request in order to point out targets (hopefully with a visual aid such as highlighting targets)
        * that an entity (such as a creature card, or a player) can perform an action on (for example attack or enchant a card.
        * @constructor
        * @param gameId  The Id of this game currently being played
        * @param id  The Id of this entity which requests to perform an action
        * @param action  The name of this action requested to be performed
        */
        RequestTargetsMessage: function(gameId, id, action) {
            this.gameId = gameId;
            this.id = id;
            this.action = action;
        },

                /**
        * Make a specific type of request to the server.
        * <p>
        * This is used to request an action from the server which requires server-side information.
        * @constructor
        * @param request  This request
        * @param message  The message accompanying this request
        */
        ServerQueryMessage: function(request, message) {
            this.request = request;
            this.message = message;

            this.toString = function() {
                return "ServerQueryMessage: Request" + this.request + " message: " + this.message;
            };
        },


        /**
        * Request to start a new game.
        * <p>
        * This is sent from the Client to the Server when this player invites another player (including AI) to start a new game of a chosen type.
        * @constructor
        * @param opponent  The Id of the player entity being invited by this player
        * @param gameType  The type / mod of the game chosen by this player
        */
        StartGameRequest: function(opponent, gameType) {
            this.opponent = opponent;
            this.gameType = gameType;
        },

        /**
        * Serialize message from JSON to byte.
        * <p>
        * Primarily used for libGDX client.
        * Constructor.
        * @param type  This message type
        */
        TransformerMessage: function(type) {
            this.type = type;
        },

        /**
        * Message for a game entity to use a certain ability.
        * <p>
        * Game entities (e.g., cards, players) may have one or more ability actions that they can perform.
        * Certain abilities can have multiple targets, hence the use of an array.
        * @constructor. (multiple targets)
        * <p>
        * Used for multiple target actions.
        *
        * @param gameId  This current game
        * @param entity  This game entity performing an action
        * @param action  This action
        * @param targets  The set of multiple targets affected by this action
        */
        UseAbilityMessage: function(gameId, id, action, targets) {
            this.gameId = gameId;
            this.id = id;
            this.action = action;
            this.targets = targets;

            this.toString = function() {
                return "UseAbilityMessage" +
                    "[id=" + this.id +
                    ", action=" + this.action +
                    ", gameId=" + this.gameId +
                    ", targets=" + this.targets.toString() +
                    "]";
            };
        },

        /**
        * Chat message in game lobby.
        * <p>
        * These are messages printed to the game lobby which are visible to all users present at the time the message is posted.
        * @constructor
        * @param message  The content of this chat message
        */
        ChatMessage: function(message) {
            this.chatId = MAIN_LOBBY;
            this.message = message;

            this.toString = function() {
                return "ChatMessage [chatId=" + chatId + ", message=" + message + ", from=" + from + "]";
            };
        },

        /**
        * Request to invite a player to start a new game.
        * @constructor
        * @param id  The Id of this invite request
        * @param name  The name of the player being invited
        * @param gameType  The game type of this invite request
        */
        InviteRequest: function(id, name, gameType) {
            this.id = id;
            this.name = name;
            this.gameType = gameType;
        },

        /**
        * Response to an InviteRequest message.
        * @constructor
        * @param inviteId  Id of this incoming InviteRequest message
        * @param accepted  Whether or not the InviteRequest is accepted
        */
        InviteResponse: function(inviteId, accepted) {
            this.inviteId = inviteId;
            this.accepted = accepted;
        },

        /**
        * Player configuration for a given game.
        * @constructor
        * @param gameId  This game
        * @param modName  The mod name for this game
        * @param configs  Map of player name and applicable player configuration
        */
        PlayerConfigMessage: function(gameId, modName, configs) {
            this.gameId = gameId;
            this.modName = modName;
            this.configs = configs;

            this.toString = function() {
                return "PlayerConfigMessage{" +
                    "configs=" + configs +
                    ", gameId=" + gameId +
                    ", modName='" + modName + '\'' +
                    '}';
            };
        }
    },
    /**
    * Initializes the API for use.
    *
    * @param server:string -- The server that to be connected to.
    * @param isSecure:boolean -- Whether or not the server is being connected to with wss
    *
    * This sets up all the message types to inherit the main `Message` class, and sets
    * up the websocket that will be used to communicate to the server, and to recieve
    * information from the server.
    *
    */
    init: function(server, isSecure, onReady, onError) {
        var types = this.messageTypes;
        var self = this; // for the events

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
        var secureAddon = (isSecure ? "s" : "");
         // if the protocol is not found in the string, store the correct protocol (is secure?)
        var protocolAddon = (wsProtocolFinder.test(server) ? "" : "ws" + secureAddon + "://");
        var socket = new WebSocket(protocolAddon + server);

        socket.onopen = onReady;

        socket.onerror = function() {
            onError();
            this.socket = null;
        }

        this.socket = socket;
    },

    /**
    * Sends a message to the server
    *
    * @param message:Message -- The message to send
    * @error SocketNotReadyException -- The socket is not ready to be used
    * @error NotInitializedException -- The API has not yet been initialized
    */
    sendMessage: function(message) {
        var socket = this.socket;
        var self = this;
        if(socket) {
            if(socket.readyState === SOCKET_OPEN) {
                this.socket.send(JSON.stringify(flatten(message)));
                console.log("Sending to server", message);
            } else {
                throw new SocketNotReadyException("The Websocket is not ready to be used.", socket.readyState);
            }
        } else {
            throw new NotInitializedException("The API has not yet been initialized.");
        }
    },

    /**
    * Sets an event listener for when the server sends a message
    * and the message command is one of the keys in the commandMap
    *
    * @param commandMap:Object -- The keys are the command types and the values are
    *       functions to run when a message of that command is encountered.
    * @param scope:$scope -- The scope of the controller running this.
    */
    setMessageListener: function(commandMap, scope) {
        this.socket.onmessage = function(message) {
            var data = JSON.parse(message.data);
            var command = data.command;

            console.log("Received message", data);

            if(commandMap.hasOwnProperty(command)) {
                scope.$apply(function() {
                    commandMap[command](data);
                });
            }
        }
    },

    /**
    * Adds types to the types to listen for in the message event listener
    *
    * @param types:[string] -- The types to add
    */
    addEventTypes: function(types) {
        eventTypes = eventTypes.concat(types);
    },

    /**
    * Removes the message event listener
    */
    removeMessageListener: function() {
        this.socket.onmessage = null;
    }
};

module.exports = CardshifterServerAPI;
