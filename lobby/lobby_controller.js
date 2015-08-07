CardshifterApp.controller("LobbyController", function($scope, $interval, $timeout) {
	$scope.users = [];
	$scope.chatMessages = [];
	var getUsersMessage = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");

	$interval(function() { // update chat and users
		$scope.users = []; // reset the list in case a user left
		CardshifterServerAPI.sendMessage(getUsersMessage);

		while(message = CardshifterServerAPI.getMessage()) {
			switch(message.command) {
				case "userstatus":
                    // do conditional checking if user is offline
                    $scope.users.push(message);
					break;
		        case "chat":
		            $scope.chatMessages.push(message);
		            break;
			}
		}
	}, 2000);

	$scope.sendMessage = function() {
		$scope.sending = true;
		var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage(thisUser.userId,
																		thisUser.username,
																		$scope.user_chat_message);
		CardshifterServerAPI.sendMessage(chatMessage);

		$scope.user_chat_message = ""; // clear the input box
		$timeout(function() { // allow another message to be sent in 3 seconds
			$scope.sending = false;
		}, 3000);
	}
});