/* global dynamicHtmlController */

"use strict";

/**
 * Refreshes the top navbar.
 * Note: Declaring outside scope so it can be called from other files.
 * @returns {undefined}
 */
let refreshTopNavbar;

const topNavbarController = function() {
    const topNavbar = document.getElementById("top_navbar");
    const topNavbarHeader = document.getElementById("top_navbar_header");
    const topNavbarTitle = topNavbarHeader.querySelector("#top_navbar_title");
    
    refreshTopNavbar = function() {
        showUsernameIfLoggedIn();
        addLogoutButton();
    };

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
            topNavbarTitle.appendChild(separator);
            topNavbarTitle.appendChild(usernameDisplay);
        }
    };
    
    /**
     * Adds a Logout button when user is logged in, to return to the login screen.
     * @returns {undefined}
     */
    const addLogoutButton = function() {
        if (localStorage.getItem("loggedIn") === "true") {
            const logoutButton = document.createElement("input");
            logoutButton.id = "logout_button";
            logoutButton.name = logoutButton.id;
            logoutButton.type = "button";
            logoutButton.className = "btn btn-navbar csh-button";
            logoutButton.value = "Logout";
            document.getElementById("logout_button_container").appendChild(logoutButton);
            logoutButton.addEventListener("click", logout);
        }
    };
    
    /**
     * Closes the game server connection, updates localStorage, reloads the page.
     * @returns {undefined}
     */
    const logout = function() {
        global.gameServerWebSocketConnection.close();
        global.gameServerWebSocketConnection = null;
        localStorage.setItem("loggedIn", false);
        window.location.reload(false);
    };
    
    /**
     * IIFE to run top navbar.
     * @type undefined
     */
    const runTopNavbarController = function() {
        logDebugMessage("runTopNavbarController called");
        showUsernameIfLoggedIn();
        addLogoutButton();
    }();
};