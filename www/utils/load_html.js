/* global fetch */

/*
 * Replicates the functionality of jQuery's `load()` function, 
 * used to load some HTML from another file into the current one.
 * Based on this Stack Overflow answer:
 * https://stackoverflow.com/a/38132775/3626537
 * 
 * @param {string} parentElementId - The ID of the DOM element to load into
 * @param {string} htmlFilePath - The path of the HTML file to load
 */
const loadHtml = function(parentElementId, htmlFilePath) {
    fetch(htmlFilePath)
        .then(function(response) {
            return response.text();
        })
        .then(function(body) {
            if (parentElementId.startsWith("#")) {
                parentElementId.replace("#", "");
            }
            document.getElementById(parentElementId).innerHTML = body;
        });
};