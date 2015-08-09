var CardshifterApp = angular.module("CardshifterApp", ["ngRoute", "ngFitText"]);

CardshifterApp.config(function($routeProvider) {
    $routeProvider
        .when("/", { // default page is Login
            controller: "LoginController",
            templateUrl: "login/login.html",
        })
        .when("/lobby", {
            controller: "LobbyController",
            templateUrl: "lobby/lobby.html",
        })
});