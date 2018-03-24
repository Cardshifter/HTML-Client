/* global GAME_SERVERS, DEBUG, CardshifterServerAPI */

const loginHandler = function() {
    const serverSelectContainer = document.getElementById("login_server_select_container");
    const serverSelect = serverSelectContainer.querySelector("#login_server_list");
    const serverOtherInputContainer = serverSelectContainer.querySelector("#login_server_other_container");
    const serverLoading = serverSelectContainer.querySelector("#server_connecting");
    const connStatusMsg = serverSelectContainer.querySelector("#login_server_connection_status");

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
     * Tests the WebSocket connection to a server and displays a message on the page
     * to give the user information about the connection status.
     * @returns {undefined}
     */
    const testWebsocketConnection = function() {
        // TODO make logic for other server
        const serverUri = serverSelect.value;
        const isSecure = false;
        
        let msgText = "";
        
        if (serverUri !== "") {
            displayConnStatus("connecting", serverUri);

            const onReady = function() {
                makeServerSelectReadWrite();
                msgText = displayConnStatus("success", serverUri);
                if (DEBUG) { console.log(msgText); }
            };
            const onError = function() {
                makeServerSelectReadWrite();
                msgText = displayConnStatus("failure", serverUri);
                if (DEBUG) { console.log(msgText); }
            };
            CardshifterServerAPI.init(serverUri, isSecure, onReady, onError);
            makeServerSelectReadOnly(serverUri);
        }
        else {
            displayConnStatus("unknown", serverUri);
        }
    };
    
    /**
     * Displays connection status in the page.
     * @param {string} status - Keyword representing the connection status
     * @param {type} serverUri - The URI of the server the client is connecting to
     * @returns {String} - The message text, largely for debug purposes
     */
    const displayConnStatus = function(status, serverUri) {
        let msgText = "";
        switch (status.toLowerCase()) {
            case "connecting":
                msgText = 
                    `<h5>Connecting to server...</h5>` + 
                    `<pre class='bg-warning'>` + 
                        `Address: ${serverUri}` + 
                        `\n${new Date()}` +
                    `</pre>`;
                connStatusMsg.className = "label label-warning";
                connStatusMsg.innerHTML = msgText;
                break;
            case "success":
                msgText =
                    `<h5>WebSocket connection OK.</h5>\n` +
                    `<pre class='bg-success'>`+ 
                        `Address: ${serverUri}` +
                        `\n${new Date()}` +
                    `</pre>`;
                connStatusMsg.innerHTML = msgText;
                connStatusMsg.className = "label label-success";
                break;
            case "failure":
                msgText = 
                    `<h5>WebSocket connection FAILED.</h5>\n` +
                    `<pre class='bg-danger'>`+ 
                        `Address: ${serverUri}` +
                        `\n${new Date()}` +
                    `</pre>`;
                connStatusMsg.innerHTML = msgText;
                connStatusMsg.className = "label label-danger";
                break;
            case "unknown":
            default:
                msgText = `<h5>Unknown connection status...</h5>`;
                connStatusMsg.innerHTML = msgText;
                connStatusMsg.className = "label label-default";
                break;
        }
        return msgText;
    };
    
    /**
     * Hides the `select` element and shows a read-only `input` instead.
     * @param {string} serverUri
     * @returns {undefined}
     */
    const makeServerSelectReadOnly = function(serverUri) {
        const selector = document.getElementById("login_server_list");
        const connecting = document.getElementById("server_connecting");
        selector.style.display = "none";
        connecting.style.display = "block";
        connecting.value = `Connecting to ${serverUri}...`;
    };
    
    /**
     * Makes the server `select` element visible and hides the read-only `input`
     * @param {string} serverUri
     * @returns {undefined}
     */
    const makeServerSelectReadWrite = function() {
        const selector = document.getElementById("login_server_list");
        const connecting = document.getElementById("server_connecting");
        selector.style.display = "block";
        connecting.style.display = "none";
    };

    /**
     * Displays an input field for server address if "Other" server is selected.
     * @returns {undefined}
     */
    const handleServerSelectChanges = function() {
        if (serverSelect.value) {
            serverOtherInputContainer.style.display = "none";
        }
        else {
            serverOtherInputContainer.style.display = "block";
        }
    };
    
    /**
     * Attempts to login to game server.
     * @returns {undefined}
     */
    const tryLogin = function() {
        const username = document.getElementById("login_username").value;
        if (username === "") {
            displayNoUsernameWarning();
        }
        else {
            const SUCCESS = 200;
            const serverUri = serverSelect.value;
            const isSecure = false;
            var loggedIn = null;
            
            const onReady = function() {
                let login = new CardshifterServerAPI.messageTypes.LoginMessage(username);
                try {
                    CardshifterServerAPI.setMessageListener(function(welcome) {
                        if(welcome.status === SUCCESS && welcome.message === "OK") {
                            localStorage.setItem("username", username);
                            localStorage.setItem("id", welcome.userId);
                            localStorage.setItem("playerIndex", null);
                            localStorage.setItem("game", { "id" : null, "mod" : null });                           
                        }
                        else {
                            console.log(`${new Date()} server message: ${welcome.message}`);
                            loggedIn = false;
                        }
                    }, ["loginresponse"]);
                    CardshifterServerAPI.sendMessage(login);
                }
                catch(error) {
                    console.log(`LoginMessage error(error 2): ${error}`);
                    loggedIn = false;
                }
            };
            
            const onError = function() {
                console.log("Websocket error(error 1)");
                loggedIn = false;
            };
            
            CardshifterServerAPI.init(serverUri, isSecure, onReady, onError);
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
        //handleServerSelectChanges();
        document.getElementById("login_server_list").addEventListener("change", handleServerSelectChanges, false);
        document.getElementById("login_server_list").addEventListener("change", testWebsocketConnection, false);
        document.getElementById("login_submit").addEventListener("click", tryLogin, false);
        testWebsocketConnection();
    }();
};
