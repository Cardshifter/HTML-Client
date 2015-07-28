(function(window, undefined) {
    var login_information = document.login_information;
    
    var server = login_information.server;
    var serverOther = login_information.server_other;
    var serverOtherContainer = document.getElementById("server_other");
    var username = login_information.username;
    var isSecure = login_information.secure;
    var submit = login_information.submit;
    var isOther = false;
    
    submit.onclick = function() {
        var finalServer = (isOther ? serverOther.value : server.value);
        console.log(finalServer);
    }
    
    server.onclick = function() {
        console.log(this.value);
        if(this.value === "other") {
            serverOtherContainer.style.display = "block";
            isOther = true;
        } else {
            serverOtherContainer.style.display = "none";
            isOther = false;
        }
    }
    
})(Function("return this")());
