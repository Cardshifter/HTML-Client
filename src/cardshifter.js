'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');

var CardshifterApp = angular.module("CardshifterApp", [ngRoute]);
CardshifterApp.config(function($routeProvider) {
    $routeProvider
        .when("/", { // default page is Login
            controller: "LoginController",
            template: require('./login/login.html')
        })
        .when("/lobby", {
            controller: "LobbyController",
            template: require('./lobby/lobby.html')
        })
        .when("/deck_builder", {
            controller: "DeckbuilderController",
            template: require('./deck_builder/deck_builder.html')
        })
});