CardshifterApp.controller("LobbyController", function($scope) {
    $scope.users = [];
    function pollUsers() {
        console.log("starting to poll users");
        $scope.users = []; // reset list in case a user left
        var queryMessage = CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
        CardshifterServerAPI.sendMessage(queryMessage);

        console.log(CardshifterServerAPI.incomingMessages);

        var user;
        while(user = CardshifterServerAPI.getMessage()) {
            $scope.users.push(user);
        }

        window.setTimeout(pollUsers, 5000); // refresh every 5 seconds
    }

    window.setTimeout(pollUsers, 5000);
});