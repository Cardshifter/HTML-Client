/* global GAME_SERVERS */

const loginHandler = function() {
    const serverSelect = document.getElementById("login_server_list");
    const serverOtherInputContainer = document.getElementById("login_server_other_container");

    const populateServerSelect = function() {
        for (let key in GAME_SERVERS) {
            if (GAME_SERVERS.hasOwnProperty(key)) {
                const option = document.createElement("option");
                option.text = key;
                option.value = GAME_SERVERS[key];
                serverSelect.add(option);
            }
        }
    };
    
    const showOtherServerInputWhenApplicable = function() {
        serverSelect.addEventListener("change", function() {
            if (serverSelect.value) {
                serverOtherInputContainer.style.display = "none";
            }
            else {
                serverOtherInputContainer.style.display = "block";
            }
        });
    };
    
    
    const tryLogin = function() {
        const userName = document.getElementById("login_username").value;
        if (userName === "") {
            document.getElementById("login_username_container").innerHTML += 
                    "<span class='label label-danger'>" + 
                        "Please enter a user name." +
                    "</span>"
            ;
            
        }
        else {
            // TODO add login logic
            alert(`Username is ${userName}`);
        }
    };
    
    const runLoginHandler = function() {
        populateServerSelect();
        showOtherServerInputWhenApplicable();
        document.getElementById("login_submit").addEventListener("click", tryLogin, false);
    };
    
    runLoginHandler();
};
