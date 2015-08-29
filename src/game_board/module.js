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
  
  .controller('GameOverMessageController', function ($scope, $modalInstance, message) {
    $scope.message = message;
    $scope.ok = function () {
        $modalInstance.close();
    };
  })
  .directive('instantRemove', function($animate) {
      return {
        scope: {
            card: '=cardData'
        },
        link: function(scope, element) {
            $animate.on("leave", element, function(element, phase) {
                if (phase === 'close') {
                    scope.card.animations.HEALTH.splice(0, 1);
                }
            });
            $animate.leave(element);
        }
      };
  })
  .directive('dynamicAnimation', function() {
      return {
        template: '<button instant-remove card-data="card" ng-repeat="item in ctrl.items" class="diff-animation btn btn-sm btn-success active glyphicon glyphicon-heart" style="cursor:default">{{item.diff}}</button>',
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
