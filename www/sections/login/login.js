/* global GAME_SERVERS */

const loginHandler = function() {
    const serverSelect = document.getElementById("login_server_list");
    const serverOtherInputContainer = document.getElementById("login_server_other_container");

    /**
     * Adds options to the server selection based on GAME_SERVERS global.
     * @returns {undefined}
     */
    const populateServerSelect = function() {
        for (let key in GAME_SERVERS) {
            if (GAME_SERVERS.hasOwnProperty(key)) {
                const option = document.createElement("option");
                option.text = key;
                option.value = GAME_SERVERS[key];
                serverSelect.add(option);
            }
        }
    };

    /**
     * Displays an input field for server address if "Other" server is selected.
     * @returns {undefined}
     */
    const showOtherServerInputWhenApplicable = function() {
        serverSelect.addEventListener("change", function() {
            if (serverSelect.value) {
                serverOtherInputContainer.style.display = "none";
            }
            else {
                serverOtherInputContainer.style.display = "block";
            }
        });
    };
    
    /**
     * Attempts to login to game server.
     * @returns {undefined}
     */
    const tryLogin = function() {
        const userName = document.getElementById("login_username").value;
        if (userName === "") {
            displayNoUsernameWarning();
        }
        else {
            // TODO add login logic
            alert(`Username is ${userName}`);
        }
    };
    
    /**
     * Displays a warning if no username is entered.
     * @returns {undefined}
     */
    const displayNoUsernameWarning = function() {
        const container = document.getElementById("login_username_container");
        if (!container.querySelector("#login_username_missing_msg")) {
            const msg = document.createElement("span");
            msg.id = "login_username_missing_msg";
            msg.className = "label label-danger";
            msg.innerHTML = "Please enter a username.";
            container.appendChild(msg);
        }
    };
    
    /**
     * IIFE to setup the login handling for the page it is loaded in.
     * @type undefined
     */
    const runLoginHandler = function() {
        populateServerSelect();
        showOtherServerInputWhenApplicable();
        document.getElementById("login_submit").addEventListener("click", tryLogin, false);
    }();
};
