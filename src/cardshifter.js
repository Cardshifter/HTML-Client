'use strict';
require('./cardshifter.css');
var angular = require('angular')
var ngRoute = require('angular-route');
var uiBootstrap = require("angular-bootstrap-npm");
var lobby = require('./lobby/module');
var login = require('./login/module');
var deckBuilder = require('./deck_builder/module');
var topNavbar = require('./top_navbar/module');
var gameBoard = require("./game_board/module");
var test = require("./test/module");
var ngAnimate = require('angular-animate');
var errorCreator = require("./error/module");

angular.module("CardshifterApp", [
    ngRoute,
    ngAnimate,
    topNavbar.name,
    deckBuilder.name,
    lobby.name,
    login.name,
    gameBoard.name,
    test.name,
    uiBootstrap,
    errorCreator.name
]).config(function($locationProvider) {
    $locationProvider.html5Mode(true);
}).config(function($routeProvider) {
    $routeProvider.otherwise('/');
});
