/* global dynamicHtmlController, browser */

"use strict";

const topNavbarController = function() {
    let isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const topNavbar = document.getElementById("top_navbar");
    const topNavbarHeader = document.getElementById("top_navbar_header");
    const topNavbarTitle = topNavbarHeader.querySelector("#top_navbar_title");

    /**
     * Appends the username to the top navbar along with a separator.
     * @returns {undefined}
     */
    const showUsernameIfLoggedIn = function() {
        /* TODO
         * This handling is iffy, it doesn't update on login,
         * but it does on page reloads, which show online
         * even if not logged in.
         * It should be either handled better, or removed.
         */
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
        else {
            topNavbarTitle.innerHTML = "Cardshifter";
        }
    };
    
    /**
     * Adds a Logout button when user is logged in, to return to the login screen.
     * @returns {undefined}
     */
    const addLogoutButton = function() {
        /* TODO
         * This handling is iffy, it doesn't update on login,
         * but it does on page reloads, which show online
         * even if not logged in.
         * It should be either handled better, or removed.
         */
        if (isLoggedIn) {
            const logoutButton = document.createElement("input");
            logoutButton.id = "logout_button";
            logoutButton.name = logoutButton.id;
            logoutButton.type = "button";
            logoutButton.className = "btn btn-navbar csh-button";
            logoutButton.value = "Logout";
            document.getElementById("logout_button_container").appendChild(logoutButton);
            logoutButton.addEventListener("click", function() {
                localStorage.setItem("loggedIn", false);
                dynamicHtmlController.unloadHtmlById("lobby");
                dynamicHtmlController.loadHtmlFromFile("login", "sections/login/login.html")
                .then(function() {
                    loginController();
            
                });
            });
        }
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