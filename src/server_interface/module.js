'use strict';
var angular = require('angular');
var serverInterface = require('./server_interface');
var debug = require("debug");

debug.enable("cardshifter:*");

// TODO: This is not great but it will do for a decent middleground
module.exports = angular.module('cardshifter.api', [])
    .factory('CardshifterServerAPI', serverInterface)
    .constant("debug", debug("cardshifter:api"));
