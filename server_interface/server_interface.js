(function(window, undefined) {
	var wsProtocolFinder = /ws(s)*:\/\//; // checks if the string begins with either ws:// or wss://, as user may enter it that way

	function Message(command) {
		this.command = command;
	}
	window.CardshifterServerAPI = {
		socket: null,
		messageTypes: {
			LoginMessage: function(username) {
				this.username = username;
			},
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
					return "UseAbilityMessage [id=" + this.id + ", action=" + this.action + ", gameId=" + this.gameId + ", targets=" + this.targets.toString() + "]";
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
					return "PlayerConfigMessage{ configs=" + configs + ", gameId=" + gameId + ", modName='" + modName + '\'' + '}';
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
			
			var secureAddon = (isSecure ? : "s" : ""); // secure websocket is wss://, rather than ws://
			var protocolAddon = (wsProtocolFinder.test(server) ? "" : "ws" + secureAddon + "://"); // if the protocl is not found in the string, store the correct protocol (is secure?)
			var socket = new WebSocket(protocolAddon + server);
			this.socket = socket;
		},
		sendMessage: function(message) {
			this.socket.send(JSON.stringify(message));
		}
	};
})(Function("return this")());
