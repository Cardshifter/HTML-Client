<template>
  <div class="login">
      <TopNavbar></TopNavbar>
    <!-- Server status -->
    <h4>Server Status</h4>
    <div class="server-status">
        <table>
            <!-- Should these be dynamically loaded? -->
            <tr>
                <th>Server</th>
                <th>Online</th>
                <th>Users</th>
                <th>Mods</th>
                <th>Games</th>
                <th>AIs</th>
                <th>Latency</th>
            </tr>
            <tr v-for="server in serverOptions" v-if="server.name !== 'Other...'">
                <td>{{server.name}}</td>
                <td>{{server.isOnline ? "true" : "false"}}</td>
                <td>{{!server.userCount ? '-' : `${server.userCount - 1} ${server.userCount - 1 === 1 ? 'user' : 'users'}`}}</td>
                <td>
                  <ul class="server-mod-list">
                    <li v-for="key in server.availableMods">
                      <router-link :to='`/cards?server=${server.address}&mod=${key}`'>
                        {{ key }}
                      </router-link>
                    </li>
                  </ul>
                </td>
                <td>{{!server.gamesRunning ? '-' : `${server.gamesRunning} ${server.gamesRunning === 1 ? 'game' : 'games'}`}}</td>
                <td>{{!server.ais ? '-' : `${server.ais} ${server.ais === 1 ? 'AI' : 'AIs'}`}}</td>
                <td>{{! server.latency ? '-' : `${server.latency} ms`}}</td>
            </tr>
        </table>
        <input @click="refreshServers()" :disabled="refreshing" type="button" value="Refresh" class="btn btn-navbar" style="margin-top: 10px;"/>
        <p v-if="refreshing">Refreshing...</p>
    </div>

    <!-- LOGIN FORM -->
    <h4>Please log in to continue, or see below for instructions and assistance.</h4>

    <form name="login_information" id="login_information" class="login-form">
        <div class="form-group">
            <label for="server" aria-label="Server" class="server-label">
                Server:
            </label>
            <select v-model="chosenServer" name="server" id="server" class="form-control">
                <option v-for="server in serverOptions" :value="server.address">{{server.name}}</option>
            </select>
            <!-- Removing because the functionality doesn't exist and it can confuse users -->
    <!--        <label for="secure">Is secure server:</label>
            <input data-ng-model="is_secure" name="secure" id="secure" type="checkbox" value="secure" />-->
        </div>
        <div class="form-group">
            <div v-if="chosenServer === 'other'" id="server_other">
                <label for="server_other_input">Other Server:</label>
                <input v-model="other_server" name="server_other_input" id="server_other_input" type="text" class="form-control" />
            </div>
        </div>
        <div class="form-group">
            <label for="username" class="username-label">
                Username:
            </label>
            <input v-model="username" name="username" id="username" type="text" class="form-control" placeholder="Enter name..." />
        </div>
        <div class="form-group">
            <b-alert dismissible variant="danger" @dismissed="errorMessage = null" :show="errorMessage !== null">{{ errorMessage }}</b-alert>
            <input @click="login()" :disabled="loggedIn" name="submit" id="submit" type="button" value="Log in" class="btn btn-success" />
        </div>
    </form>

    <!-- WELCOME AND HELP LINK -->

    <div class="welcome-information">
        <h3>Getting started</h3>

        <p>To begin playing, first select the server you would like to connect to:</p>
        <ul>
            <li><strong>Official Server: </strong>A public server hosted by the Cardshifter development team.</li>
            <li><strong>Local Host: </strong>Select this if you are hosting a local game server on your own machine.</li>
            <li><strong>Other: </strong> Enter a server address manually.</li>
        </ul>
        <p>Then enter a user name and click <strong>Log in</strong>.</p>

        <h3 class="cyborg-font" style="font-weight: bold;">Cyborg Chronicles</h3>
        <p class="cyborg-font">A dystopian, cyberpunk themed game featuring human factions, war machines and interplanetary conflict.</p>
        <!-- <ul>
            <li><h4 class="cyborg-font"><a href=#>Game rules</a></h4></li>
            <li><h4 class="cyborg-font"><a href=#>Cards</a></h4></li>
        </ul> -->

        <h3 class="mythos-font" style="font-weight: bold;">MYTHOS</h3>
        <p class="mythos-font">Magical and Mythical Creatures clash while Gods, Goddesses and Heroes of Legend fight for human worship.</p>
        <!-- <ul>
            <li><h4 class="mythos-font"><a href=#>Game rules</a></h4></li>
            <li><h4 class="mythos-font"><a href=#>Cards</a></h4></li>
        </ul> -->
        <!-- <h3 style="text-decoration: underline;">About Cardshifter</h3> -->

        <ul>
            <!-- <li><h4><a href="http://stats.zomis.net/io-web">Official Website</a></h4></li> -->
            <li><h4><a href="https://github.com/Cardshifter">On GitHub</a></h4></li>
        </ul>
    </div>
  </div>
</template>

<script>
import CardshifterServerAPI from "../server_interface";
import TopNavbar from "./TopNavbar";

const loginStorageMap = {
    "CARDSHIFTER_LAST_NAME": "username",
    "CARDSHIFTER_LAST_SERVER": "server",
    "CARDSHIFTER_LAST_OTHER_SERVER": "other_server",
    "CARDSHIFTER_LAST_IS_SECURE": "is_secure"
};

const SUCCESS = 200;
const UPDATE_DELAY = 10000;
const REFRESH_DELAY = 3000;

export default {
  name: "Login",
  data() {
    return {
      serverOptions: [
        { name: "Official Server", address: "ws://gbg.zomis.net:22738", ais: 0 },
        { name: "Local Development Server", address: "ws://127.0.0.1:4243", ais: 0 },
        { address: "other", name: "Other..." }
      ],
      username: "",
      errorMessage: null,
      loggedIn: false,
      refreshing: false,
      chosenServer: null
    };
  },
  components :{
      TopNavbar
  },
  methods: {
    /*
    * Called by the login form. This function will to the server
    * specified in the login form. Upon a successful reply, the
    * code will setup currentUser and redirect to the lobby.
    *
    * This function will not complete if the user has not entered
    * a username, or if there were any errors at all in logging
    * in (either something with the Socket messed up, or the
    * welcome message response from the server did not contain
    * the properties that would indicate a success)
    */
    login: function() {
      if (!this.username) {
        this.errorMessage = "Please enter a username";
        return;
      }
      this.loggedIn = true;
      let finalServer = (this.chosenServer === "other" ? this.other_server : this.chosenServer);

      let component = this;
      CardshifterServerAPI.init(finalServer, this.is_secure, function() {
        let login = new CardshifterServerAPI.messageTypes.LoginMessage(component.username);
        CardshifterServerAPI.sendMessage(login);
      }, function() {
          // notify the user that there was an issue logging in (websocket issue)
          component.errorMessage = "There was a Websocket-related issue logging in";

          console.log("Websocket error(error 1)");
          component.loggedIn = false;
      });
    },
    errorResponse: function(response) {
      this.errorMessage = response.message;
      this.loggedIn = false;
    },
    loginResponse: function(welcome) {
        if (welcome.status === SUCCESS && welcome.message === "OK") {
            let currentUser = {
                username: this.username,
                id: welcome.userId,
                playerIndex: null,
                game: {
                    id: null,
                    mod: null
                }
            };

            // for remembering form data
            for (var storage in loginStorageMap) {
                if (loginStorageMap.hasOwnProperty(storage)) {
                    localStorage.setItem(storage, this[loginStorageMap[storage]]);
                }
            }
            console.log(currentUser);
            this.$router.push({ name: 'Lobby', params: { currentUser: currentUser }});
        } else {
            this.errorMessage = welcome.message;
            console.log("server messsage: " + welcome.message);
            this.loggedIn = false;
        }
    },
    refreshServers: function() {
      console.log(this.serverOptions);
      // this.refreshing = true;
      // $timeout(function() {
      //     this.refreshing = false;
      // }, REFRESH_DELAY);
      function checkServer(thisServer) {

        var now = Date.now();
        console.log("Checking server: " + thisServer.address);
        let ws = new WebSocket(thisServer.address);
        ws.onopen = () => {
          thisServer.latency = Date.now() - now;
          thisServer.isOnline = true;

          var getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("STATUS", "");
          getUsers.command = "query";
          ws.onmessage = function(message) {
            let serverData = JSON.parse(message.data);
            thisServer.userCount = serverData.users;
            thisServer.availableMods = serverData.mods;
            thisServer.gamesRunning = serverData.games;
            thisServer.ais = serverData.ais;
            console.log(thisServer);
            ws.close();
          };
          ws.send(JSON.stringify(getUsers));
        };
        ws.onerror = () => {
          thisServer.latency = 0;
          thisServer.isOnline = false;
          thisServer.userCount = 0;
        }
      }

      for (let i = 0; i < this.serverOptions.length - 1; i++) { // Skip the last "Other" server
        checkServer(this.serverOptions[i]);
      }
    }
  },
  computed: {
    token: function() {
      if (this.$auth.isAuthenticated()) {
        return this.$auth.getToken();
      }
      return false;
    }
  },
  created() {
    this.chosenServer = this.serverOptions[0];
    CardshifterServerAPI.$on('type:loginresponse', this.loginResponse);
    CardshifterServerAPI.$on('type:error', this.errorResponse);
    for(var storage in loginStorageMap) {
        if(loginStorageMap.hasOwnProperty(storage)) {
            this[loginStorageMap[storage]] = localStorage.getItem(storage) || "";
        }
    }
    this.refreshServers();
  },
  beforeDestroy() {
    CardshifterServerAPI.$off('type:loginresponse', this.loginResponse);
    CardshifterServerAPI.$off('type:error', this.errorResponse);
  }
};
</script>

<style>
@import "../assets/style.css";

.input-group {
  width: 30%;
  margin: auto;
}
.server-status {
    font-size: 0.8em;
    padding-bottom: 10px;
}
.server-mod-list {
    font-size: 0.9em;
    padding : 0;
    margin: 0;
    list-style-type: none;
}
.server-label {
    font-size: 0.8em;
}
.username-label {
    font-size: 0.8em;
}
.welcome-information {
    font-size: 0.8em;
}
</style>
