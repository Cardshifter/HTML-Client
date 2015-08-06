CardshifterApp.controller("LoginController", function($scope, $location, $rootScope) {
	$scope.login = function() {
		$scope.loggedIn = true;
		var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

		CardshifterServerAPI.init(finalServer, $scope.is_secure, function() {
			var login = CardshifterServerAPI.messageTypes.LoginMessage($scope.username);
			console.log("suck chess");

			try {
				console.log("Sending login and changing path");
				CardshifterServerAPI.sendMessage(login);

				$rootScope.$apply(function() {
					$location.path("/lobby");
				});
				console.log("shud chang");
			} catch(e) {
				// notify the user that there was an issue logging in (loginmessage issue)
				console.log("LoginMessage error(error 2)");
			}
		}, function() {
			// notify the user that there was an issue logging in (websocket issue)
			console.log("Websocket error(error 1)");
		});
	}
});