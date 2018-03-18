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
    const serverSelector = document.getElementById("login_server_list");
    const serverOtherInputContainer = document.getElementById("login_server_other_container");

    serverSelector.addEventListener("change", function() {
        if (!serverSelector.value) {
            serverOtherInputContainer.style.display = "block";
        }
        else {
            serverOtherInputContainer.style.display = "none";
        }
    });
};
