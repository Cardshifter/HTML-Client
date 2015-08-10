'use strict';
require('./lobby.css');
var angular = require('angular');
var ngRoute = require('angular-route');
var LobbyCtrl = require('./controller');
var template = require('./lobby.html');

module.exports = angular.module('cardshifter.lobby', [ngRoute])
  .config(function($routeProvider) {
    $routeProvider.when('/lobby', {
      controller: LobbyCtrl,
      template: template
    })
  });