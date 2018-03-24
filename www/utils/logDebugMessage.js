/* global DEFAULT_DATE_FORMAT */

/**
 * Log a debug message to the browser's JavaScript console.
 * @param {String} msg
 * @param {String} dateFormat
 * @returns {undefined}
 */
const logDebugMessage = function(msg, dateFormat=DEFAULT_DATE_FORMAT) {
    const timestamp = new Date();
    console.log(`DEBUG | ${formatDate(timestamp, dateFormat)} | ${msg}`);
};