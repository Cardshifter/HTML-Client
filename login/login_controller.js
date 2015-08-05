var CardshifterApp = angular.module("Cardshifter");

CardshifterApp.controller("LoginController", function($scope) {
	$scope.login = function() {
		CardshifterServerAPI.sendMessage( new CardshifterServerAPI.messageTypes.LoginMessage($scope.username) );
	}
});