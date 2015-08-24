'use strict';
     require('./test.css');
     var angular = require('angular');
     var ngRoute = require('angular-route');
     var TestController = require('./controller');
     var template = require('./test.html');
     var serverInterface = require('../server_interface/module');
     var ngAnimate = require('angular-animate');

     module.exports = angular.module('cardshifter.test', [ngRoute, ngAnimate, serverInterface.name])
       .config(function($routeProvider) {
         $routeProvider.when('/test', {
           controller: TestController,
           template: template
         })
       });