'use strict';

// @ngInject
function LoginController(CardshifterServerAPI, $scope, $location, $rootScope, ErrorCreator) {
    var SUCCESS = 200;

    // see if there is remembered form data
    var loginStorageMap = {
        "CARDSHIFTER_LAST_NAME": "username",
        "CARDSHIFTER_LAST_SERVER": "server",
        "CARDSHIFTER_LAST_OTHER_SERVER": "other_server",
        "CARDSHIFTER_LAST_IS_SECURE": "is_secure"
    };

    for(var storage in loginStorageMap) {
        if(loginStorageMap.hasOwnProperty(storage)) {
            $scope[loginStorageMap[storage]] = localStorage.getItem(storage) || "";
        }
    }

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

        if(!$scope.username) {
            ErrorCreator.create("Please enter a username");

            $scope.loggedIn = false;
            return;
        }

        CardshifterServerAPI.init(finalServer, $scope.is_secure, function() {

            var login = new CardshifterServerAPI.messageTypes.LoginMessage($scope.username);

            CardshifterServerAPI.setMessageListener({
                "loginresponse": function(welcome) {
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

                        // for remembering form data
                        for(var storage in loginStorageMap) {
                            if(loginStorageMap.hasOwnProperty(storage)) {
                                localStorage.setItem(storage, $scope[loginStorageMap[storage]]);
                            }
                        }

                        $location.path("/lobby");
                    } else {
                        console.log("server messsage: " + welcome.message);
                        $scope.loggedIn = false;
                        $scope.$apply();
                    }
                }
            }, $scope);
            CardshifterServerAPI.sendMessage(login);
        }, function() {
            // notify the user that there was an issue logging in (websocket issue)
            ErrorCreator.create("There was a Websocket-related issue logging in");

            console.log("Websocket error(error 1)");
            $scope.loggedIn = false;
            $scope.$apply();
        });
    }
};

module.exports = LoginController;
