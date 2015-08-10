'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var LoginCtrl = require('./controller');
var template = require('./login.html');

module.exports = angular.module('cardshifter.login', [ngRoute])
  .config(function($routeProvider) {
    $routeProvider.when('/', {
      controller: LoginCtrl,
      template: template
    });
  });
  