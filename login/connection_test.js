loginInformation = document.login_information;

loginInformation.elements.test_websocket.addEventListener("click", init);

var server
  , username
  , testMessage
  , websocketOutput;

function init() {

  server = document.getElementById("server").value.toString();
  if (server === "other") {
    server = document.getElementById("server_other_input").value.toString();
  }
  username = document.getElementById("username").value.toString();
  testMessage = document.getElementById("test_message").value.toString();
  if (!testMessage) {
    testMessage = '{ "command": "login", "username": "' + username + '" }';
  }

  websocketOutput = document.getElementById("websocket_output");

  testWebSocket();
}

function testWebSocket() {

  // Message to append input values to document prior to printing test results
  var wsHeader = document.createElement("h3");
  wsHeader.innerHTML = "Testing WebSocket connection...";
  websocketOutput.appendChild(wsHeader);

  var wsInput = document.createElement("p");
  wsInput.innerHTML =
    "Server: " + server + "<br/>" +
    "Username: " + username +  "<br/>" +
    "Message: " + testMessage;

  websocketOutput.appendChild(wsInput);

  // Begin WebSocket test

  websocket = new WebSocket(server);
  websocket.onopen = function(evt) {
    onOpen(evt)
  };
  websocket.onclose = function(evt) {
    onClose(evt)
  };
  websocket.onmessage = function(evt) {
    onMessage(evt)
  };
  websocket.onerror = function(evt) {
    onError(evt)
  };
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
  websocket.close();
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
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  websocketOutput.appendChild(pre);
}
