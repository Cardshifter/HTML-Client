CardshifterApp.controller("LoginController", function($scope) {
	$scope.login = function() {
		var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

		CardshifterServerAPI.init(finalServer, $scope.is_secure);
		var login =  new CardshifterServerAPI.messageTypes.LoginMessage($scope.username);
		try {
			CardshifterServerAPI.sendMessage(login);
		} catch (e) {
			console.log(e);
		}
	}
});