var CardshifterApp = angular.module("CardshifterApp", ["ngRoute"]);

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
        .when("/deck_builder", {
            controller: "DeckbuilderController",
            templateUrl: "deck_builder/deck_builder.html"
        })
});