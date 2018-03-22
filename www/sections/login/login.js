/* global GAME_SERVERS, DEBUG, CardshifterServerAPI */

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
    
    const testWebsocketConnection = function() {
        // FIXME If an offline server is selected, then an online server is selected,
        // the offline server's timeout will call `onError` and display that server's
        // connection failure, even if an online server is selected.
        const serverSelectContainer = document.getElementById("login_server_select_container");
        const serverSelect = serverSelectContainer.querySelector("#login_server_list");
        const serverUri = serverSelect.value;
        const isSecure = false;
        
        const connStatusMsg = serverSelectContainer.querySelector("#login_server_connection_status");
        const msgText = `<h5>Connecting to server...</h5> <pre class='bg-warning'>Address: ${serverUri}</pre>`;
        connStatusMsg.className = "label label-warning";
        connStatusMsg.innerHTML = msgText;
        connStatusMsg.style = "display: block; text-align: left";
        
        let connEstablished = null;
        
        const onReady = function() {
            connEstablished = true;
            const msgText =
                `<h5>WebSocket connection OK.</h5>\n` +
                `<pre class='bg-success'>`+ 
                    `Address: ${serverUri}` +
                    `\n${new Date()}` +
                `</pre>`;
            if (DEBUG) { console.log(msgText); }
            // GUI
            connStatusMsg.innerHTML = msgText;
            connStatusMsg.className = "label label-success";
        };
        const onError = function() {
            if (!connEstablished) {
                const msgText =
                    `<h5>WebSocket connection FAILED.</h5>\n` +
                    `<pre class='bg-danger'>`+ 
                        `Address: ${serverUri}` +
                        `\n${new Date()}` +
                    `</pre>`;
                if (DEBUG) { console.log(msgText); }
                // GUI
                connStatusMsg.innerHTML = msgText;
                connStatusMsg.className = "label label-danger";
            }
        };
        CardshifterServerAPI.init(serverUri, isSecure, onReady, onError);
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
        document.getElementById("login_server_list").addEventListener("change", testWebsocketConnection, false);
        document.getElementById("login_submit").addEventListener("click", tryLogin, false);
        testWebsocketConnection();
    }();
};
