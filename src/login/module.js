'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var LoginCtrl = require('./controller');
var template = require('./login.html');
var serverInterface = require('../server_interface/module');

module.exports = angular.module('cardshifter.login', [ngRoute, serverInterface.name])
  .config(function($routeProvider) {
    $routeProvider.when('/', {
      controller: LoginCtrl,
      template: template
    });
  });
