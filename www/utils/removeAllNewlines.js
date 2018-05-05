/**
 * Removes all newlines (and tabs) \r \n \t from a string
 * @param {string} str - the string to remove newlines from
 * @returns {string}
 */
const removeAllNewlines = function(str) {
    return str.replace(/(\r\n\t|\n|\r\t)/gm, "");
};