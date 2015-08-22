'use strict';

// @ngInject
function LoginController(CardshifterServerAPI, $scope, $location, $rootScope) {
    var SUCCESS = 200;
    var LAST_NAME = "CARDSHIFTER_LAST_NAME";

    $scope.username = localStorage.getItem(LAST_NAME) || "";

    /*
    * Called by the login form. This function will to the server
    * specified in the login form. Upon a successful reply, the
    * code will setup currentUser and redirect to the lobby.
    *
    * This function will not complete if the user has not entered
    * a username, or if there were any errors at all in logging
    * in (either something with the Socket messed up, or the
    * welcome message response from the server did not contain
    * the properties that would indicate a success)
    */
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
                                playerIndex: null,
                                game: {
                                    id: null,
                                    mod: null
                                }
                            };

                            localStorage.setItem(LAST_NAME, $scope.username);

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
