'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var GameboardController = require('./controller');
var template = require('./game_board.html');
var serverInterface = require('../server_interface/module');
var cardModelStyle = require("../card_model/card_model.css");
var ngAnimate = require('angular-animate');

module.exports = angular.module('cardshifter.gameBoard', [ngRoute, ngAnimate, serverInterface.name])
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
  .directive('dynamicAnimation', function() {
      return {
        template: '<button ng-repeat="item in ctrl.items" class="diff-animation btn btn-sm btn-success active glyphicon glyphicon-heart" style="cursor:default">{{item.diff}}</button>',
        scope: {
            items: '='
        },
        replace: true,
        controller: function($interval) {
        },
        bindToController: true,
        controllerAs: 'ctrl'
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
        replace: true,
        template: require('../card_model/card_template.html')
    };
  });
