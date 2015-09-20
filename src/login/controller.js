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

                            // for remembering form data
                            for(var storage in loginStorageMap) {
                                if(loginStorageMap.hasOwnProperty(storage)) {
                                    localStorage.setItem(storage, $scope[loginStorageMap[storage]]);
                                }
                            }

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

    $scope.refreshServers = function() {
        $scope.refreshing = true;
        $timeout(function() {
            $scope.refreshing = false;
        }, REFRESH_DELAY);

        /**
        * This is a recursive function that is called
        * once the Websocket has successfully connected
        * with the server. Once it is connected, the
        * Websocket is obliterated.
        *
        * This is used in place of the loop because
        * API.init is a mostly async method, so the
        * loop would rapidly terminate, and the sockets
        * will be destroyed at the incorrect points in
        * order for the "blank users"(#92) to be prevented.
        */
        var i = 0;
        (function getServerInfo() {
            var thisServer = $scope.servers[i];

            if(thisServer.name === "Other...") {
                return;
            }

            var now = Date.now();

            CardshifterServerAPI.init(thisServer.address, false, function() {
                thisServer.latency = Date.now() - now;
                thisServer.isOnline = true;

                /* This must be created here because this is run after init is don't, so command is set properly */
                var getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("STATUS", "");

                CardshifterServerAPI.sendMessage(getUsers);
                CardshifterServerAPI.setMessageListener(function(message) {

                    /* For some reason, local host always said 1 user online, but dwarftowers did not. */
                    thisServer.userCount = message.users;
                    thisServer.availableMods = message.mods.length;
                    thisServer.gamesRunning = message.games;
                    thisServer.ais = message.ais;

                    // Should these (^^) be dynamically loaded?

                    CardshifterServerAPI.socket.close();
                    CardshifterServerAPI.socket = null;

                    i++;
                    if($scope.servers[i]) {
                        getServerInfo();
                    }
                }, ["status"]);
            }, function() {
                thisServer.latency = 0;
                thisServer.isOnline = false;
                thisServer.userCount = 0;

                i++;
                if($scope.servers[i]) {
                    getServerInfo();
                }
            })
        })();
    };

    $scope.refreshServers(); // call it on startup

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
        this.availableMods = 0;
        this.gamesRunning = 0;
        this.ais = 0;
    }
};

module.exports = LoginController;
