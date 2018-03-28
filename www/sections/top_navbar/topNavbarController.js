"use strict";

const topNavbarController = function() {
    const topNavbar = document.getElementById("top_navbar");
    const topNavbarBrand = topNavbar.querySelector("#top_navbar_header");
    const topNavbarTitle = topNavbarBrand.querySelector("#top_navbar_title");

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
    
    const addLogoutButton = function() {
        const logoutButton = document.createElement("input");
        logoutButton.id = "logout_button";
        logoutButton.type = "button";
        logoutButton.className = "btn btn-navbar csh-button nav-item";
        logoutButton.value = "Log out";
        topNavbar.appendChild(logoutButton);
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