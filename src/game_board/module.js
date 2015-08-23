'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var GameboardController = require('./controller');
var template = require('./game_board.html');
var serverInterface = require('../server_interface/module');

module.exports = angular.module('cardshifter.gameBoard', [ngRoute, serverInterface.name])
  .config(function($routeProvider) {
    $routeProvider.when('/game_board', {
      controller: GameboardController,
      template: template
    })
  })
  
  .controller('ModalInstanceCtrl', function ($scope, $modalInstance, message) {
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
            actions: '=',
            targets: '=',
            doingAction: '='
        },
        template: require('../card_model/card_template.html')
    };
  });
