'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var DeckBuilderController = require('./controller');
var serverInterface = require('../server_interface/module');
var template = require('./template.html');

module.exports = angular.module('cardshifter.deckBuilder', [ngRoute, serverInterface.name])
  .config(function($routeProvider) {
    $routeProvider.when("/deck_builder", {
        controller: DeckBuilderController,
        template: template
    });
  });
