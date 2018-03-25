/* global fetch */
"use strict";

/**
 * Controls the loading, unloading, showing and hiding of HTML sections dynamically.
 * @returns {DynamicHtmlController}
 */
const DynamicHtmlController = function() {
    this.defaultParentElement = document.getElementById("body");
    this.fetchParams = {
        method: "GET",
        headers: { "Content-Type": "text/html" },
        mode: "cors",
        cache: "default"
    };
    
    /**
     * Loads a chunk of HTML data into the DOM.
     * @param {string} newDivId - The `id` to assign to the containing `div` element.
     * @param {string} filePath - The location of the HTML file from which to load.
     * @param {HTMLElement} parentElement - (Optional) The element into which the HTML is loaded.
     * @returns {unresolved}
     */
    DynamicHtmlController.prototype.loadHtmlFromFile = function(newDivId, filePath, parentElement=this.defaultParentElement) {
        return fetch(filePath, this.fetchParams)
        .then(function (response) {
            return response.text();
        })
        .then(function (htmlContent) {
            const newHtmlContent = document.createElement("div");
            newHtmlContent.id = newDivId;
            newHtmlContent.innerHTML = htmlContent;
            parentElement.appendChild(newHtmlContent);
            logDebugMessage(`File "${filePath}" loaded into element ID "${parentElement.id}"`);
        })
        .catch(function(err) {
            throw new FailureToLoadHTMLException(
                `Could not load "${filePath} ` + 
                `into element ID "${parentElement.id}"` +
                `\n${err}`
            );
        });
    };
    
    /**
     * Removes an element from the DOM.
     * @param {type} elementId - The `id` of the element to remove.
     * @returns {undefined}
     */
    DynamicHtmlController.prototype.unloadById = function(elementId) {
        document.getElementById(elementId).remove();
    };
};

const FailureToLoadHTMLException = function(message) {
    this.name = "FailureToLoadHTMLException";
    this.message = message;
    this.stack = (new Error()).stack;
};

FailureToLoadHTMLException.prototype = new Error;