var angular = require('angular');

module.exports = angular.module("cardshifter.errorCreator", [])
    .controller("ErrorPopupController", function($scope, $modalInstance, message) {
        $scope.message = message;
        $scope.ok = function() {
            $modalInstance.close();
        };
    });