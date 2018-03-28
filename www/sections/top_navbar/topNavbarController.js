"use strict";

const topNavbarController = function() {
    /**
     * Appends the username to the top navbar along with a separator.
     * @returns {undefined}
     */
    const showUsernameIfLoggedIn = function() {
        if (localStorage.getItem("loggedIn") === "true") {
            const username = localStorage.getItem("username");
            const separator = document.createElement("span");
            separator.innerHTML = " | ";
            const usernameDisplay = document.createElement("span");
            usernameDisplay.className = "h4";
            usernameDisplay.innerHTML = username;
            const topNavbarHeader = document.getElementById("top_navbar_header");
            topNavbarHeader.appendChild(separator);
            topNavbarHeader.appendChild(usernameDisplay);
        }
    };
    
    /**
     * IIFE to run top navbar.
     * @type undefined
     */
    const runTopNavbarController = function() {
        logDebugMessage("runTopNavbarController called");
        showUsernameIfLoggedIn();
    }();
};