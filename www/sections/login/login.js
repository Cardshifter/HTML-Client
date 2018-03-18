/* global GAME_SERVERS */

const loginHandler = function() {
    const selectLoginServerList = document.getElementById("login_server_list");
    for (let key in GAME_SERVERS) {
        if (GAME_SERVERS.hasOwnProperty(key)) {
            const option = document.createElement("option");
            option.text = key;
            option.value = GAME_SERVERS[key];
            selectLoginServerList.add(option);
        }
    }
};