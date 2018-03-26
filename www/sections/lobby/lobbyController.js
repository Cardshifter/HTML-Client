"use strict";

const lobbyController = function() {
    const showUsernameIfLoggedIn = function() {
        if (localStorage.getItem("loggedIn") === "true") {
            const username = localStorage.getItem("username");
            const separator = document.createElement("span");
            separator.innerHTML = " | ";
            const usernameDisplay = document.createElement("span");
            usernameDisplay.className = "h4";
            usernameDisplay.innerHTML = username;
            document.getElementById("top_navbar_title").appendChild(separator);
            document.getElementById("top_navbar_title").appendChild(usernameDisplay);
        }
    };
    
    /**
     * IIFE to control the lobby.
     * @type undefined
     */
    const runLobbyController = function() {
        logDebugMessage("lobbyController called");
        showUsernameIfLoggedIn();
    }();
};