'use strict';

// @ngInject
function LoginController(CardshifterServerAPI, $scope, $location, $rootScope, $timeout) {
    var SUCCESS = 200;
    var UPDATE_DELAY = 10000;
    var REFRESH_DELAY = 3000;

    $scope.refreshing = false;

    $scope.servers = [
        new ServerInfo("Local Host", "ws://127.0.0.1:4243"),
        new ServerInfo("Dwarf Towers", "ws://dwarftowers.com:4243"),
        new ServerInfo("Zomis.net", "ws://stats.zomis.net:4243"),
        new ServerInfo("Other...", "other")
    ];

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

    $scope.refreshServers = function() {
        $scope.refreshing = true;
        $timeout(function() {
            $scope.refreshing = false;
        }, REFRESH_DELAY);

        for(var i = 0, length = $scope.servers.length; i < length; i++) {
            if($scope.servers[i].name === "Other...") {
                continue;
            }

            var now = Date.now();

            /**
            * The reason why there is all this anonymous function
            * returning anonymous function magic is because this
            * init method happens asynchronously, and that means
            * that the local thisServer variable is going to change
            * almost instantaneously to the very last server in the
            * list.
            */
            (function(thisServer) {
                CardshifterServerAPI.init(thisServer.address, false, function() {
                    thisServer.latency = Date.now() - now;
                    thisServer.isOnline = true;
                }, function() {
                    thisServer.latency = 0;
                    thisServer.isOnline = false;
                    thisServer.userCount = 0;
                })
            })($scope.servers[i]);
        }
    };

    /**
    * The ServerInfo class.
    * @constructor
    *
    * @param name:string -- The name of the server
    * @param address:string -- The address of the server
    *
    * This class is used for displaying the various
    * available servers at the top of the screen
    * in the server status table.
    */
    function ServerInfo(name, address) {
        this.name = name;
        this.address = address;
        this.isOnline = false;
        this.userCount = 0;
        this.latency = 0;
    }
};

module.exports = LoginController;
