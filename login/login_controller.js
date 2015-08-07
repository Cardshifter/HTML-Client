CardshifterApp.controller("LoginController", function($scope, $location, $rootScope) {
    var SUCCESS = 200;

    $scope.login = function() {
        $scope.loggedIn = true;
        var finalServer = ($scope.server === "other" ? $scope.other_server : $scope.server);

        CardshifterServerAPI.init(finalServer, $scope.is_secure, function() {
            var login = new CardshifterServerAPI.messageTypes.LoginMessage($scope.username);

            try {
                CardshifterServerAPI.sendMessage(login, function(serverResponse) {
                    if(serverResponse.status === SUCCESS && serverResponse.message === "OK") {
                        $rootScope.$apply(function() {
                            $location.path("/lobby");
                        });
                    } else {
                        // I don't actually know what the server will respond with
                        // notify the user that there was an issue logging in (custom server issue ???)

                        console.log("server message: " + serverResponse.message);
                        $scope.loggedIn = false;
                    }
                });

            } catch(e) {
                // notify the user that there was an issue logging in (loginmessage issue)
                console.log("LoginMessage error(error 2): " + e);
                $scope.loggedIn = false;
            }
        }, function() {
            // notify the user that there was an issue logging in (websocket issue)
            console.log("Websocket error(error 1)");
            $scope.loggedIn = false;
        });
    }
});