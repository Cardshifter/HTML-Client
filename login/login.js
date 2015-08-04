(function(window, undefined) {

    /* Login information data obtained from user input in HTML form */
    var loginInformation = document.login_information;
    
    var server = login_information.server;
    var serverOther = loginInformation.server_other_input;
    var serverOtherContainer = document.getElementById("server_other_input");
    var username = loginInformation.username;
    var isSecure = loginInformation.secure;
    var submit = loginInformation.submit;
    var isOther = false;
    

    submit.onclick = function() {
        /* Verify if user selected one of the provided servers, or entered another server of their choosing */
        var finalServer = (isOther ? serverOther.value : server.value);
        console.log(finalServer);
    }
    

    server.onclick = function() {
        console.log(this.value);
        /* Display a text input field if user select "other" as server so that server can be entered manually */
        if(this.value === "other") {
            serverOtherContainer.style.display = "block";
            isOther = true;
        } else {
            serverOtherContainer.style.display = "none";
            isOther = false;
        }
    }
    
})(Function("return this")());
