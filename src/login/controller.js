'use strict';

// @ngInject
function LoginController(CardshifterServerAPI, $scope, $location, $rootScope) {
    var SUCCESS = 200;

    $scope.login = function() {
        $scope.loggedIn = true;
        var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

        CardshifterServerAPI.init(finalServer, $scope.is_secure, function() {
            if($scope.username) {
                var login = new CardshifterServerAPI.messageTypes.LoginMessage($scope.username);

                try {
                    CardshifterServerAPI.setMessageListener(function(welcome) {
                        if(welcome.status === SUCCESS && welcome.message === "OK") {
                            // taking the easy way out
                            window.currentUser = {
                                username: $scope.username,
                                id: welcome.userId,
                                game: {
                                    id: null,
                                    mod: null,
                                    playerInfo: {
                                        index: null,
                                        id: null,
                                        properties: {}
                                    },
                                    oppInfo: {
                                        index: null,
                                        id: null,
                                        properties: {}
                                    }
                                }
                            };

                            $rootScope.$apply(function() {
                                $location.path("/lobby");
                            });
                        } else {
                            console.log("server messsage: " + welcome.message);
                            $scope.loggedIn = false;
                            $scope.$apply();
                        }
                    }, ["loginresponse"]);
                    CardshifterServerAPI.sendMessage(login);

                } catch(e) {
                    // notify the user that there was an issue logging in (loginmessage issue)
                    console.log("LoginMessage error(error 2): " + e);
                    $scope.loggedIn = false;
                    $scope.$apply();
                }
            } else {
                console.log("enter a username");
                $scope.loggedIn = false;
                $scope.$apply();
            }
        }, function() {
            // notify the user that there was an issue logging in (websocket issue)
            console.log("Websocket error(error 1)");
            $scope.loggedIn = false;
            $scope.$apply();
        });
    }
};

module.exports = LoginController;
