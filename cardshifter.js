var CardshifterApp = angular.module("CardshifterApp", ["ngRoute"]);

CardshifterApp.config(function($routeProvider) {
	$routeProvider
		.when("/", { // default page is Login
			controller: "LoginController",
			// file name might change
			templateUrl: "login/login_angular.html"
		})
		/*.when("/login", {
			controller: "LoginController",
			// file name might change
			templateUrl: "login/login_angular.html"
		})*/
		/*.when("/lobby", {

		})
		.when("/game", {

		})*/
});