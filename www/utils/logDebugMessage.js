const logDebugMessage = function(msg, dateFormat="yyyy/MM/dd hh:mm:ss") {
    const timestamp = new Date();
    console.log(`DEBUG | ${formatDate(timestamp, dateFormat)} | ${msg}`);
};