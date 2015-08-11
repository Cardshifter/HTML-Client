'use strict';
var angular = require('angular');
var template = require('./template.html');

module.exports = angular.module('cardshifter.topNavbar', [])
  .directive('topNavbar', function() {
    return {
      template: template
    };
  });
