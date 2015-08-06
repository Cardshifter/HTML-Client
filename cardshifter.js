var CardshifterApp = angular.module("CardshifterApp", ["ngRoute"]);

CardshifterApp.config(function($routeProvider) {
	$routeProvider
		.when("/", { // default page is Login
			controller: "LoginController",
			templateUrl: "login/login.html",
			css: "login/login.css"
		})
		.when("/lobby", {
			controller: "LobbyController",
			templateUrl: "lobby/lobby.html",
			css: "lobby/lobby.css"
		})
});