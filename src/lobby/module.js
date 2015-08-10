'use strict';
require('./lobby.css');
var angular = require('angular');
var ngRoute = require('angular-route');
var LobbyCtrl = require('./controller');
var template = require('./lobby.html');
var serverInterface = require('../server_interface/module');

module.exports = angular.module('cardshifter.lobby', [ngRoute, serverInterface.name])
  .config(function($routeProvider) {
    $routeProvider.when('/lobby', {
      controller: LobbyCtrl,
      template: template
    })
  });