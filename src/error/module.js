"use strict";
var angular = require("angular");
var errorCreator = require("./error_creator");

module.exports = angular.module("cardshifter.errorCreator", [])
    .service("ErrorCreator", errorCreator)
    .controller("ErrorPopupController", function($scope, $modalInstance, message) {
        $scope.message = message;
        $scope.ok = function() {
            $modalInstance.close();
        };
    });