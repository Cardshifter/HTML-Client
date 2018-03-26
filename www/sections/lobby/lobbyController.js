"use strict";

const lobbyController = function() {
    const showUsernameIfLoggedIn = function() {
        if (localStorage.getItem("loggedIn") === "true") {
            const username = localStorage.getItem("username");
            document.getElementById("top_navbar_title").innerHTML += ` | ${username}`;
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