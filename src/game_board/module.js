'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var GameboardController = require('./controller');
var template = require('./game_board.html');
var serverInterface = require('../server_interface/module');
var cardModelStyle = require("../card_model/card_model.css");

module.exports = angular.module('cardshifter.gameBoard', [ngRoute, serverInterface.name])
  .config(function($routeProvider) {
    $routeProvider.when('/game_board', {
      controller: GameboardController,
      template: template
    })
  })
  
  .controller('GameOverMessageController', function ($scope, $modalInstance, message) {
    $scope.message = message;
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
  })
  
  .directive('card', function() {
      return {
        scope: {
            card: '=cardInfo',
            selectEntity: '&selectEntity',
            startAction: '&startAction',
            actions: '=',
            targets: '=',
            doingAction: '='
        },
        template: require('../card_model/card_template.html')
    };
  });
