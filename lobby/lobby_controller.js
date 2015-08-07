CardshifterApp.controller("LobbyController", function($scope, $interval, $timeout) {
	$scope.users = [];
	$scope.chatMessages = [];

	var getUsersMessage = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
	CardshifterServerAPI.sendMessage(getUsersMessage);

	$interval(function() { // update chat and users
		while(message = CardshifterServerAPI.getMessage()) {
			switch(message.command) {
				case "userstatus":
                    // do conditional checking if user is offline
                    if(message.status === "OFFLINE") {
						for(var i = 0, length = $scope.users.length; i < length; i++) {
							// if the user described in the message is the user in this iteration
							if($scope.users[i].name === message.name) {
								$scope.users.splice(i, 1); // remove that user from the array
							}
						}
                    } else {
                    	$scope.users.push(message);
                    }

					break;
		        case "chat":
		            $scope.chatMessages.push(message);
		            break;
			}
		}
	}, 2000);

	$scope.sendMessage = function() {
		$scope.sending = true;
		var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage($scope.user_chat_message);
		CardshifterServerAPI.sendMessage(chatMessage);

		$scope.user_chat_message = ""; // clear the input box
		$timeout(function() { // allow another message to be sent in 3 seconds
			$scope.sending = false;
		}, 3000);
	}
});