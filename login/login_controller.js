CardshifterApp.controller("LoginController", function($scope, $location) {
	$scope.login = function() {
		var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

		CardshifterServerAPI.init(finalServer, $scope.is_secure, function() {
			var login = CardshifterServerAPI.messageTypes.LoginMessage($scope.username);

			try {
				console.log("Sending login and changing path");
				CardshifterServerAPI.sendMessage(login);
				$location.path("/lobby");
			} catch(e) {
				// notify the user that there was an issue logging in
			}
		});
	}
});