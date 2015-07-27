(function(window, undefined) {
    var login_information = document.login_information;
    
    var server = login_information.server;
    var username = login_information.username;
    var isSecure = login_information.secure;
    
    login_information.submit.onclick = function() {
        console.log("Server: " + server.value);
        console.log("Username: " + username.value);
        console.log("Is secure: " + isSecure.value);
    }
    
})(Function("return this")());
