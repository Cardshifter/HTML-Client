(function(window, undefined) {
	// checks if the string begins with either ws:// or wss://
	var wsProtocolFinder = /ws(s)*:\/\//; 

	function Message(command) {
		this.command = command;
	}
	window.CardshifterServerAPI = {
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
				this.gamdId = gameId;
				this.id = id;
				this.action = action;
			},
            
            
			ServerQueryMessage: function(request, message) {
				this.request = request;
				this.message = message;
				
				this.toString = function() {
					return "ServerQueryMessage: Request" + this.request + " message: " + this.message;
				};
			},
			StartGameRequest: function(opponent, gameType) {
				this.opponent = opponent;
				this.gameType = gameType;
			},
			TransformerMessage: function(type) {
				this.type = type;
			},
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
			ChatMessage: function(chatId, from, message) {
				this.chatId = chatId;
				this.from = from;
				this.message = message;
				
				this.toString = function() {
					return "ChatMessage [chatId=" + chatId + ", message=" + message + ", from=" + from + "]";
				};
			},
			InviteRequest: function(id, name, gameType) {
				this.id = id;
				this.name = name;
				this.gameType = gameType;
			},
			InviteResponse: function(inviteId, accepted) {
				this.inviteId = inviteId;
				this.accepted = accepted;
			},
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
		init: function(server, isSecure) {
			var types = this.messageTypes;
			
			types.LoginMessage.prototype = new Message("login");
			types.RequestTargetsMessage.prototype = new Message("requestTargets");
			types.ServerQueryMessage.prototype = new Message("query");
			types.StartGameRequest.prototype = new Message("startgame");
			types.TransformerMessage.prototype = new Message("serial");
			types.UseAbilityMessage.prototype = new Message("use");
			types.ChatMessage.prototype = new Message("chat");
			types.InviteRequest.prototype = new Message("inviteRequest");
			types.InviteResponse.prototype = new Message("inviteResponse");
			types.PlayerConfigMessage = new Message("playerconfig");
			
			 // secure websocket is wss://, rather than ws://
			var secureAddon = (isSecure ? "s" : "");
			 // if the protocol is not found in the string, store the correct protocol (is secure?)
			var protocolAddon = (wsProtocolFinder.test(server) ? "" : "ws" + secureAddon + "://");
			var socket = new WebSocket(protocolAddon + server);
			this.socket = socket;
		},
		sendMessage: function(message) {
			this.socket.send(JSON.stringify(message));
		}
	};
})(Function("return this")());
