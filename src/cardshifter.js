'use strict';
require('./cardshifter.css');
var angular = require('angular')
var ngRoute = require('angular-route');
var lobby = require('./lobby/module');
var login = require('./login/module');
var deckBuilder = require('./deck_builder/module');
var topNavbar = require('./top_navbar/module');

var CardshifterApp = angular.module("CardshifterApp", [ngRoute, login.name]);
CardshifterApp.config(function($routeProvider) {
    $routeProvider
        .when("/lobby", {
            controller: "LobbyController",
            template: require('./lobby/lobby.html')
        })
        .when("/deck_builder", {
            controller: "DeckbuilderController",
            template: require('./deck_builder/deck_builder.html')
        })
});
