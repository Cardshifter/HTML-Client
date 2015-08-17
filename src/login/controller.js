'use strict';

// @ngInject
function LoginController(CardshifterServerAPI, $scope, $location, $rootScope) {
    var SUCCESS = 200;

    $scope.servers = {
        "Local Host": {
            address: "ws://127.0.0.1:4243",
            isOnline: false,
            userCount: 0,
            latency: 0
        },
        "dwarftowers.com": {
            address: "ws://dwarftowers.zom:4243",
            isOnline: false,
            userCount: 0,
            latency: 0
        },
        "zomis.net": {
            address: "ws://stats.zomis.net:4243",
            isOnline: false,
            userCount: 0,
            latency: 0
        },
        "Other...": {
            address: "other",
            isOnline: null,
            userCount: null,
            latency: null
        }
    }

    $scope.login = function() {
        $scope.loggedIn = true;
        var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

        CardshifterServerAPI.init(finalServer, $scope.is_secure, function() {
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
                                mod: null
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
        }, function() {
            // notify the user that there was an issue logging in (websocket issue)
            console.log("Websocket error(error 1)");
            $scope.loggedIn = false;
            $scope.$apply();
        });
    }
};

module.exports = LoginController;
