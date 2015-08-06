var CardshifterApp = angular.module("CardshifterApp", ["ngRoute"]);

CardshifterApp.config(function($routeProvider) {
	$routeProvider
		.when("/", { // default page is Login
			controller: "LoginController",
			// file name might change
			templateUrl: "login/login.html",
			css: "login/login.css"
		})
		
});