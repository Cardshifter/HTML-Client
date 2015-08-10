'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var DeckBuilderCtrl = require('./controller');
var template = require('./template.html');

module.exports = angular.module('cardshifter.login', [ngRoute])
  .config(function($routeProvider) {
    $routeProvider.when("/deck_builder", {
        controller: DeckBuilderCtrl,
        template: template
    });
  });
