/* global fetch */

/*
 * Replicates the functionality of jQuery's `load` function, 
 * used to load some HTML from another file into the current one.
 * 
 * Based on this Stack Overflow answer:
 * https://stackoverflow.com/a/38132775/3626537
 * And `fetch` documentation:
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 * 
 * @param {string} parentElementId - The ID of the DOM element to load into
 * @param {string} htmlFilePath - The path of the HTML file to load
 */
const loadHtml = function(parentElementId, filePath) {
    const init = {
        method : "GET",
        headers : { "Content-Type" : "text/html" },
        mode : "cors",
        cache : "default"
    };
    const req = new Request(filePath, init);
    fetch(req)
        .then(function(response) {
            return response.text();
        })
        .then(function(body) {
            // Replace `#` char in case the function gets called `querySelector` or jQuery style
            if (parentElementId.startsWith("#")) {
                parentElementId.replace("#", "");
            }
            document.getElementById(parentElementId).innerHTML = body;
        });
};