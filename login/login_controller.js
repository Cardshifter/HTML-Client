CardshifterApp.controller("LoginController", function($scope) {
	$scope.login = function() {
		var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

		CardshifterServerAPI.init(finalServer, $scope.is_secure);
		var login =  new CardshifterServerAPI.messageTypes.LoginMessage($scope.username);

		// TODO: Need to find a way to make this work;
		// As written it tries to sendMessage the instant that the socket is created, in which case the socket is not ready
/*		try {
			CardshifterServerAPI.sendMessage(login);
		} catch (e) {
			console.log(e);
		}*/
	}
});