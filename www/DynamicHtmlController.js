/* global fetch */
"use strict";

/**
 * 
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
     * 
     * @param {string} newDivId
     * @param {string} filePath
     * @param {HTMLElement} parentElement
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
};

const FailureToLoadHTMLException = function(message) {
    this.name = "FailureToLoadHTMLException";
    this.message = message;
    this.stack = (new Error()).stack;
};

FailureToLoadHTMLException.prototype = new Error;