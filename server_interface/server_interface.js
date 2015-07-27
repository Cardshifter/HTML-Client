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
            }
        },
        init: function() {
            var tyeps = this.types;
            
            types.LoginMessage.prototype = new Message("login");
            types.RequestTargetsMessage.prototype = new Message("requestTargets");
        }
    }
})(Function("return this"));
