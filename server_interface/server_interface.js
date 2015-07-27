(function(window, undefined) {
    function Message(command) {
        this.command = command;
    }
    window.CardshifterServerInterface = {
        types: {
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
                }
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
                    return "UseAbilityMessage [id=" + this.id + ", action=" + this.action
				+ ", gameId=" + this.gameId + ", targets=" + this.targets.toString() + "]";
                }
            }
        },
        init: function() {
            var types = this.types;
            
            types.LoginMessage.prototype = new Message("login");
            types.RequestTargetsMessage.prototype = new Message("requestTargets");
            types.ServerQueryMessage.prototype = new Message("query");
            types.StartGameRequest.prototype = new Message("startgame");
            types.TransformerMessage.prototype = new Message("serial");
            types.UseAbilityMessage.prototype = new Message("use");
        }
    }
})(Function("return this")());
