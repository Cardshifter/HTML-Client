/* global GAME_SERVERS, CardshifterServerAPI, DEFAULT_DATE_FORMAT, dynamicHtmlController */
"use strict";

const loginController = function() {
    const serverSelectContainer = document.getElementById("login_server_select_container");
    const serverSelect = serverSelectContainer.querySelector("#login_server_list");
    const serverOtherInputContainer = serverSelectContainer.querySelector("#login_server_other_container");
    const serverLoading = serverSelectContainer.querySelector("#server_connecting");
    const connStatusMsg = serverSelectContainer.querySelector("#login_server_connection_status");
    let currentServerHasValidConnection = null;
    
    const handleUserNotLoggedIn = function() {
        populateServerSelect();
        populateRememberedUsername();
        document.getElementById("login_server_list").addEventListener("change", handleServerSelectChanges, false);
        document.getElementById("login_server_list").addEventListener("change", testWebsocketConnection, false);
        document.getElementById("login_submit").addEventListener("click", tryLogin, false);
        document.getElementById("test_login_server_other").addEventListener("click", testOtherServerConnection, false);
        testWebsocketConnection();
    };

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
    
    const populateRememberedUsername = function() {
        const rememberMe = localStorage.getItem("rememberMe") === "true";
        if (rememberMe) {
            document.getElementById("login_username").value = localStorage.getItem("username");
            document.getElementById("remember_me").checked = true;
        }
    };
    
    /**
     * Tests the WebSocket connection to a server and displays a message on the page
     * to give the user information about the connection status.
     * @returns {undefined}
     */
    const testWebsocketConnection = function() {
        const serverUri = serverSelect.value;
        const isSecure = false;
        
        let msgText = "";
        
        if (serverUri) {
            displayConnStatus("connecting", serverUri);
            /**
             * Test WebSocket connection and display status if successful.
             * @returns {undefined}
             */
            const onReady = function() {
                makeServerSelectReadWrite();
                msgText = displayConnStatus("success", serverUri);
                logDebugMessage(msgText);
                currentServerHasValidConnection = true;
            };
            /**
             * Test WebSocket connection and display status if failed.
             * @returns {undefined}
             */
            const onError = function() {
                makeServerSelectReadWrite();
                msgText = displayConnStatus("failure", serverUri);
                logDebugMessage(msgText);
                currentServerHasValidConnection = false;
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
                        `\n${formatDate(new Date())}` +
                    `</pre>`;
                connStatusMsg.className = "label label-warning";
                connStatusMsg.innerHTML = msgText;
                break;
            case "success":
                msgText =
                    `<h5>WebSocket connection OK.</h5>\n` +
                    `<pre class='bg-success'>`+ 
                        `Address: ${serverUri}` +
                        `\n${formatDate(new Date())}` +
                    `</pre>`;
                connStatusMsg.innerHTML = msgText;
                connStatusMsg.className = "label label-success";
                break;
            case "failure":
                msgText = 
                    `<h5>WebSocket connection FAILED.</h5>\n` +
                    `<pre class='bg-danger'>`+ 
                        `Address: ${serverUri}` +
                        `\n${formatDate(new Date())}` +
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
        if (!username) {
            displayNoUsernameWarning();
        }
        else {
            const isSecure = false;
            var loggedIn = null;
            
            let serverUri = serverSelect.value;
            if (!serverUri) {
                serverUri = document.getElementById("login_server_other_input").value;
            }

            /**
             * Short-circuit login attempt if we've already found that the connection not valid.
             * @type String
             */
            if (!currentServerHasValidConnection) {
                const msg = "Websocket error(error 1)";
                logDebugMessage(msg);
                displayLoginFailureWarning(msg);
            }
            
            /**
             * Attempt to log in once the WebSocket connection is ready.
             * @returns {undefined}
             */
            const onReady = function() {
                let login = new CardshifterServerAPI.messageTypes.LoginMessage(username);
                
                /**
                 * Listens for a welcome message from the game server, and stores user values in the browser.
                 * @param {Object} welcome
                 * @returns {undefined}
                 */
                const messageListener = function(welcome) {
                    const SUCCESS = 200;
                    const SUCCESS_MESSAGE = "OK";
                    if(welcome.status === SUCCESS && welcome.message === SUCCESS_MESSAGE) {
                        if (document.getElementById("remember_me").checked) {
                            localStorage.setItem("rememberMe", true);
                        }
                        localStorage.setItem("loggedIn", true);
                        localStorage.setItem("username", username);
                        localStorage.setItem("id", welcome.userId);
                        localStorage.setItem("playerIndex", null);
                        localStorage.setItem("game", { "id" : null, "mod" : null });
                        dynamicHtmlController.unloadHtmlById("login");
                        dynamicHtmlController.loadHtmlFromFile("lobby", "sections/lobby/lobby.html")
                        .then(function() {
                            lobbyController();
                        });
                    }
                    else {
                        logDebugMessage(`Server message: ${welcome.message}`);
                        loggedIn = false;
                    }
                };
                
                try {
                    CardshifterServerAPI.setMessageListener(messageListener, ["loginresponse"]);
                    CardshifterServerAPI.sendMessage(login);
                }
                catch(error) {
                    const msg = "LoginMessage error(error 2)";
                    logDebugMessage(`${msg} ${error}`);
                    displayLoginFailureWarning(msg, error);
                    loggedIn = false;
                }
            };
            
            /**
             * Log error if the connection fails
             * @returns {undefined}
             */
            const onError = function() {
                const msg = "Websocket error(error 1)";
                logDebugMessage(msg);
                displayLoginFailureWarning(msg);
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
    
    const displayLoginFailureWarning = function(message, error) {
        const container = document.getElementById("login_username_container");
        const warning = document.createElement("span");
        warning.id = "login_failure_msg";
        warning.className = "label label-danger";
        warning.style = "display: block; text-align: left;";
        warning.innerHTML = `<h5>Login failed: ${message}</h5>`;
        if (error) {
            warning.innerHTML += `<pre>${error}</pre>`;
        }
        container.appendChild(warning);
    };
    
    const testOtherServerConnection = function() {
        const otherServerInput = document.getElementById("login_server_other_input");
        const otherServerUri = otherServerInput.value;
        const isSecure = false;
        
        /**
         * Test WebSocket connection and display status if successful.
         * @returns {undefined}
         */
        const onReady = function() {
            makeServerSelectReadWrite();
            msgText = displayConnStatus("success", otherServerUri);
            logDebugMessage(msgText);
            currentServerHasValidConnection = true;
        };
        /**
         * Test WebSocket connection and display status if failed.
         * @returns {undefined}
         */
        const onError = function() {
            makeServerSelectReadWrite();
            msgText = displayConnStatus("failure", otherServerUri);
            logDebugMessage(msgText);
            currentServerHasValidConnection = false;
        };
        CardshifterServerAPI.init(otherServerUri, isSecure, onReady, onError);
        makeServerSelectReadOnly();
        displayConnStatus("connecting", otherServerUri);
    };
    
    /**
     * IIFE to run login logic.
     * @type undefined
     */
    const runLoginController = function() {
        logDebugMessage("runLoginController called");
        handleUserNotLoggedIn();
    }();
};
