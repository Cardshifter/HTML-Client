/* global DEFAULT_DATE_FORMAT, DEBUG */

/**
 * Log a debug message to the browser's JavaScript console.
 * @param {String} msg
 * @param {String} dateFormat
 * @returns {undefined}
 */
const logDebugMessage = function(msg, dateFormat=DEFAULT_DATE_FORMAT) {
    const timestamp = new Date();
    if (DEBUG) { console.log(`DEBUG | ${formatDate(timestamp, dateFormat)} | ${msg}`); }
};