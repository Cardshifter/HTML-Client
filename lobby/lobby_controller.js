CardshifterApp.controller("LobbyController", function($scope, $interval) {
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
});