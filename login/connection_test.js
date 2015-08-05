loginInformation = document.login_information;

loginInformation.elements.test_websocket.addEventListener("click", init);
loginInformation.elements.disconnect_websocket.addEventListener("click", closeWebsocket);

var server, 
  username, 
  testMessage, 
  websocketOutput;

/**
 * Get elements from web form to connect to WebSocket.
 * @deprecated  See login.js
 */
function init() {

    server = document.getElementById("server").value;
    if (server === "other") {
        server = document.getElementById("server_other_input").value;
    }
    username = document.getElementById("username").value;
    testMessage = document.getElementById("test_message").value;
    if (!testMessage) {
        testMessage = '{ "command": "login", "username": "' + username + '" }';
    }

    websocketOutput = document.getElementById("websocket_output");
    testWebSocket();
}

/**
 * Pass elements from web form to WebSocket and append messages to document.
 * @deprecated  See login.js
 */
function testWebSocket() {

    // Append input values to document prior to printing test results

    var wsHeader = document.createElement("h3");
    wsHeader.innerHTML = "Testing WebSocket connection...";
    websocketOutput.appendChild(wsHeader);

    var wsInput = document.createElement("p");
    wsInput.innerHTML =
        "Server: " + server + "<br/>" +
        "Username: " + username + "<br/>" +
        "Message: " + testMessage;

    websocketOutput.appendChild(wsInput);

    // Begin WebSocket test

    websocket = new WebSocket(server);
    websocket.onopen = function(evt) {
        onOpen(evt)
    };
    /*websocket.onclose = function(evt) {
        onClose(evt)
    };*/
    websocket.onmessage = function(evt) {
        onMessage(evt)
    };
    websocket.onerror = function(evt) {
        onError(evt)
    };

    /* Close websocket if page is closed or refreshed */
    window.onbeforeunload = function() {
        websocket.onclose = function () {}; // disable onclose handler
        websocket.close()
    };
}

function closeWebsocket() {
    websocket.onclose = function(evt) {
        onClose(evt)
    };
    websocket.close();
    //writeToScreen("DISCONNECTED");
}



function onOpen(evt) {
    writeToScreen("CONNECTED");
    doSend(testMessage);
}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
}

function onMessage(evt) {
    writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data + '</span>');
}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
    writeToScreen("SENT: " + message);
    websocket.send(message);
}

function writeToScreen(message) {
    var pre = document.createElement("p");
    //pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    websocketOutput.appendChild(pre);
}
