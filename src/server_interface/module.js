'use strict';
var angular = require('angular');
var serverInterface = require('./server_interface');

// TODO: This is not great but it will do for a decent middleground
module.exports = angular.module('cardshifter.api', [])
  .constant('CardshifterServerAPI', serverInterface);
