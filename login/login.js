(function(window, undefined) {

    /* Login information data obtained from user input in HTML form */
    var loginInformation = document.login_information;
    
    var server = login_information.server;
    var serverOther = loginInformation.server_other_input;
    var serverOtherContainer = document.getElementById("server_other_input");
    var username = loginInformation.username;
    var isSecure = loginInformation.secure;
    var testMessage = loginInformation.test_message;
    var submit = loginInformation.submit;
    var isOther = false;
    

    submit.onclick = function() {
        // Verify if user selected one of the provided servers, or entered another server of their choosing
        var finalServer = (isOther ? serverOther.value : server.value);

        // For testing print values to console
        console.log("Final server: " + finalServer);
        console.log("Username: " + username.value);
        console.log("Is Secure: " + isSecure.value);
        console.log("Test message: " + testMessage.value);

        // Append input values to document prior to printing test results

        websocketOutput = document.getElementById("websocket_output");

        var wsHeader = document.createElement("h3");
        wsHeader.innerHTML = "Testing WebSocket connection...";
        websocketOutput.appendChild(wsHeader);
        
        var printTestMessage = (testMessage.value ? testMessage.value : "No test message");     
        
        var wsInput = document.createElement("p");
        wsInput.innerHTML =
            "Server: " + finalServer + "<br/>" +
            "Username: " + username.value + "<br/>" +
            "Message: " + printTestMessage;
        websocketOutput.appendChild(wsInput);
    }
    

    server.onclick = function() {
        console.log("Select server:" + this.value);
        // Display a text input field if user select "other" as server so that server can be entered manually
        if(this.value === "other") {
            serverOtherContainer.style.display = "block";
            isOther = true;
        } else {
            serverOtherContainer.style.display = "none";
            isOther = false;
        }
    }
    
})(Function("return this")());
