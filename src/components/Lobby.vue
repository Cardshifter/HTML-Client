<template>
    <div>
        <TopNavbar :username="currentUser.username"></TopNavbar>
        <table id="lobby" class="lobby">
            <tr id="lobby-headers" class="lobby-headers">
              <td id="lobby-title" class="lobby-title">Lobby</td>
              <td id="lobby-deck-builder" class="lobby-deck-builder" width="20%">
                  <button @click="openDeckBuilder()" class="btn btn-navbar csh-button deck-builder-btn">
                      Deck Builder
                  </button>
              </td>
            </tr>
            <tr id="lobby-invite-request"class="lobby-invite-request" v-if="gotInvite">
              <td colspan="2">
                  <div id="lobby-accept-invite" class="lobby-accept-invite">
                      Game invite from {{invite.name}} to play {{invite.type}}!<br/>
                      <input @click="acceptInvite(true)" type="button" value="Accept" class="btn btn-success"/>
                      <input @click="acceptInvite(false)" type="button" value="Decline" class="btn btn-danger"/>
                      <audio ref="pingAudio">
                          <source src="../assets/ping_sound.mp3" type="audio/mpeg">
                      </audio>
                  </div>
              </td>
            </tr>
            <tr v-if="errorMessage !== null">
                <td colspan="2">
                    <b-alert dismissible variant="danger" @dismissed="errorMessage = null" :show="errorMessage !== null">{{ errorMessage }}</b-alert>
                </td>
            </tr>
            <tr id="lobby-list-headers" class="lobby-list-headers">
              <th id="lobby-message-list-header" class="lobby-message-list-header">Messages</th>
              <th id="lobby-users-list-header" class="lobby-users-list-header">Users Online</th>
            </tr>
            <tr id="lobby-lists" class="lobby-lists">
              <td id="lobby-message-list" class="lobby-message-list">
                  <ul id="lobby-chat-messages" class="lobby-chat-messages">
                      <li v-for="message in chatMessages" :class="{'user-chat-message lobby-chat-message': message.from === currentUser.username}" id="lobby-chat-message">
                          <!-- Only display from if there is a from. Errors will not have a from -->
                          [{{message.timestamp}}] {{message.from ? message.from + ":" : ""}} {{message.message}}
                      </li>
                  </ul>
              </td>
              <td id="lobby-users-list" class="lobby-users-list">
                  <ul id="lobby-users" class="lobby-users">
                      <li v-for="user in sortedUsers" id="lobby-user" class="lobby-user">
                          <label>
                              <input v-model="selected_opponent" v-if="user.userId != currentUser.id" type="radio"
                                     :value="user.userId" name="user_selection" /> {{user.name}}
                          </label>
                      </li>
                  </ul>
              </td>
            </tr>
            <tr>
              <td id="lobby-message" class="lobby-message">
                  <textarea v-model="user_chat_message" @keyup.enter="sendMessage($event)"
                            id="lobby-chat-text-area" class="lobby-chat-text-area" rows="1" cols="75" wrap="off"
                            placeholder="Enter chat message..."></textarea>
                  <input @click="sendMessage()" :disabled="sending" type="submit" value="Send" class="btn btn-navbar csh-button lobby-chat-send-btn"/>
              </td>
              <td id="lobby-invite" class="lobby-invite">
                  <input @click="startGame()" type="button" value="Invite to game!" class="btn btn-success lobby-game-invite-btn"/>
              </td>
            </tr>
            <tr id="lobby-mods" class="lobby-mods">
              <td colspan="2" id="lobby-mod-selection" class="lobby-mod-selection">
                  <form class="form-inline" role="form">
                      <div class="form-group">
                          <label for="mod_selection" class="lobby-mod-selector-label">Select game type:</label>
                          <div v-for="mod in mods" class="form-control lobby-mod-selector">
                              <label>
                                  <input v-model="selected_mod" type="radio" :value="mod"
                                         name="mod_selection" id="mod_selection"/>
                                  {{mod}}
                              </label>
                          </div>
                      </div>
                  </form>
              </td>
            </tr>
        </table>
    </div>
</template>

<script>
import CardshifterServerAPI from "../server_interface";
import TopNavbar from "./TopNavbar";

var CHAT_FEED_LIMIT = 10;
var MESSAGE_DELAY = 3000;

/**
* If a number is less than 10, this function will
* return a '0' appended to the beginning of that number
*
* This allows for cleanly formatted timestamps on chat messages.
*
* @param time:number -- The number to check
* @param string -- If the number is less than 10, '0' + time
                -- If not, just time itself.
*/
function formatTimeNumber(time) {
    return time < 10 ? "0" + time : time;
};

export default {
    name: "Lobby",
    props: ["currentUser"],
    data() {
        return {
            users: [],
            chatMessages: [],
            user_chat_message: "",
            errorMessage: null,
            sending: false,
            mods: [],
            selected_mod: null,
            selected_opponent: null,
            invite: {
                id: null,
                name: null,
                type: null
            },
            gotInvite: false
        }
    },
    components: {
        TopNavbar
    },
    methods: {
        /**
         * This function is called when the user hits the "Send" button
         * write text to the chat message text box.
         *
         * Upon click the send button or hitting the enter key, this function
         * will send a new ChatMessage to the server. Then, the clear the
         * chat message input box and disable use of the send button
         * for the time specified in MESSAGE_DELAY
         */
        sendMessage(e) {
            if (this.sending) {
                return;
            }
            if (this.user_chat_message.trim().length === 0) {
                return;
            }
            this.sending = true;
            var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage(this.user_chat_message);
            CardshifterServerAPI.sendMessage(chatMessage);

            this.user_chat_message = ""; // clear the input box
            setTimeout(() => {
                this.sending = false
            }, MESSAGE_DELAY);
        },

        /**
         * This function is called when the user has chosen a mod,
         * selected an opponent, and hit the "invite" button.
         *
         * This function sends a StartGameRequest to the server.
         */
        startGame() {
            if (this.selected_mod && this.selected_opponent) {
                var startGame = new CardshifterServerAPI.messageTypes.StartGameRequest(this.selected_opponent, this.selected_mod);
                CardshifterServerAPI.sendMessage(startGame);
            } else {
                // Error if user has not chosen a mod or opponent
                this.errorMessage = "Select both a game type and an opponent user before you can start a game.";
            }
        },

        /**
        * This function is called when either the "accept" or "decline"
        * button of the invite pop-up has been clicked.
        *
        * This function sends an InviteResponse message to the server and
        * and passes in the accept argument to the constructor. If the
        * user hit "accept", then the accept argument will be true. If
        * the user hit "decline", then the accept argument will be false.
        *
        * @param accept:boolean -- true for "accept"
                                -- false for "decline"
        */
        acceptInvite(accept) {
            if (accept) {
                this.selected_mod = this.invite.type;
            }
            var accept = new CardshifterServerAPI.messageTypes.InviteResponse(this.invite.id, accept);
            CardshifterServerAPI.sendMessage(accept);
            this.gotInvite = false;
        },

        displayError(message) {
            this.errorMessage = message.message;
        },

        /**
         * This function is called once the user has selected a mod
         * and has clicked the "Deck Builder" button near the top of the
         * screen. If the user has not yet selected a mod, then this
         * function does nothing.
         *
         * Once this is run, a ServerQueryMessage is sent to the server
         * to retrieve all the cards. The reason why this has to be sent
         * manually is because the server does not know when the user
         * is entering the deck builder, so it does not know to send
         * the card information automatically, as opposed to if the user
         * were entering a new game.
         */
        openDeckBuilder() {
            if (this.selected_mod) {
                this.currentUser.game.mod = this.selected_mod;

                var getCards = new CardshifterServerAPI.messageTypes.ServerQueryMessage("DECK_BUILDER", this.currentUser.game.mod);
                CardshifterServerAPI.sendMessage(getCards);
                this.$router.push({
                    name: 'DeckBuilder',
                    params: {
                        currentUser: this.currentUser
                    }
                });
            } else {
                this.errorMessage = "Select a game type before you can open the deck builder.";
            }
        },

        // The command map functions:
        /**
         * Based on the content of message, will add or remove
         * a user from the user list.
         */
        updateUserList(message) {
            if (message.status === "OFFLINE") {
                for (var i = 0, length = this.users.length; i < length; i++) {
                    if (this.users[i].userId === message.userId) {
                        this.users.splice(i, 1); // remove that user from the array
                        return;
                    }
                }
            } else {
                this.users.push(message);
            }
        },
        /**
         * Adds a chat message to the message feed. If the message
         * feed is at the maximum limit of messages, deletes the oldest
         * message.
         */
        addChatMessage(message) {
            if (this.chatMessages.length === CHAT_FEED_LIMIT) {
                // remove the oldest chat message
                this.chatMessages.shift();
            }

            var now = new Date();
            var HMS = [formatTimeNumber(now.getHours()), formatTimeNumber(now.getMinutes()), formatTimeNumber(now.getSeconds())].join(':');
            message.timestamp = HMS;

            this.chatMessages.push(message);
        },
        /**
         * Shows buttons and a message to this client for accepting
         * or declining a game request.
         */
        displayInvite(message) {
            this.invite.id = message.id;
            this.invite.name = message.name;
            this.invite.type = message.gameType;
            this.gotInvite = true;
            this.$refs.pingAudio.play();
        },
        /**
         * Shows to the user a list of all available mods.
         */
        displayMods(message) {
            this.mods = message.mods;
        },
        /**
         * Stores the game ID in currentUser for other controllers
         * to use and navigates to the deck-builder page for the
         * user to select a deck.
         */
        enterNewGame(message) {
            this.currentUser.game.id = message.gameId;
            this.currentUser.game.mod = this.selected_mod;
            this.currentUser.game.playerIndex = message.playerIndex;

            this.$router.push({
                name: 'DeckBuilder',
                params: {
                    currentUser: this.currentUser
                }
            });
        }
    },
    created() {
        CardshifterServerAPI.$on("type:userstatus", this.updateUserList);
        CardshifterServerAPI.$on("type:chat", this.addChatMessage);
        CardshifterServerAPI.$on("type:inviteRequest", this.displayInvite);
        CardshifterServerAPI.$on("type:availableMods", this.displayMods);
        CardshifterServerAPI.$on("type:newgame", this.enterNewGame);
        CardshifterServerAPI.$on("type:error", this.displayError);

        CardshifterServerAPI.sendMessage(new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", ""));
        CardshifterServerAPI.sendMessage(new CardshifterServerAPI.messageTypes.ServerQueryMessage("MODS", ""));
    },
    computed: {
      sortedUsers() {
        let list = this.users.slice();
        list.sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
        return list;
      }
    },
    beforeDestroy() {
        CardshifterServerAPI.$off("type:userstatus", this.updateUserList);
        CardshifterServerAPI.$off("type:chat", this.addChatMessage);
        CardshifterServerAPI.$off("type:inviteRequest", this.displayInvite);
        CardshifterServerAPI.$off("type:availableMods", this.displayMods);
        CardshifterServerAPI.$off("type:newgame", this.enterNewGame);
        CardshifterServerAPI.$off("type:error", this.displayError);
    }
};
</script>

<style>
@import "../assets/style.css";

/* WHOLE LOBBY */

#lobby {
    width: 100%;
}

/* TABLE HEADERS */

#lobby-headers {
    font-family: Georgia, Times, "Times New Roman", serif;
    text-align: center;
    color: #DDDDDD;
    background-color: #000000;

}

#lobby-title {
    font-size: 1.2em;
    font-weight: bold;
}

#lobby-deck-builder {
    width: 20%;
}

.deck-builder-btn {
    font-size: 0.8em;
}

/* SECTION HEADERS */

#lobby-list-headers {
    font-family: Georgia, Times, "Times New Roman", serif;
    font-size: 1.2em;
    text-align: center;
}

#lobby-message-list-header {
    font-size: 0.9em;
}

#lobby-users-list-header {
    font-size: 0.8em;
}

/* MAIN MESSAGE & USERS SECTIONS */

#lobby-lists {
    vertical-align: text-top;
    height: 400px;
}

#lobby-message-list {
    font-size: 0.8em !important;
}
/* List of all messages */
#lobby-chat-messages {
    list-style-type: none;
    padding-left: 0;
    font-size: 0.9em;
}

/* Alternate background color for chat messages */
#lobby-chat-messages:nth-child(even) {
    background-color: #FFFFFF;
}
#lobby-chat-message:nth-child(odd) {
    background-color: #EEEEEE;
}

/* Background color for messages from this user */
#lobby-chat-messages .user-chat-message {
    background-color: #FFCC66;
}

/* Each individual message line */
#lobby-chat-message {
}

#lobby-users-list {
    font-size: 0.9em;
    font-family: Georgia, Times, "Times New Roman", serif;
}
/* List of all users */
#lobby-users {
    list-style-type: none;
    padding-left: 0;
}
/* Each individual user line */
#lobby-user {
    font-size: 0.9em;
}

/* FOOTER SECTIONS */

#lobby-message {
    background-color: #000000;
    vertical-align: bottom;
}
/* TEXT AREA FOR TYPING CHAT MESSAGES*/
#lobby-chat-text-area {
    outline: none;
    overflow: auto;
    vertical-align: middle;
    font-size: 0.8em;
}

.lobby-chat-send-btn {
    /* Using !important to override csh-button class. */
    font-size: 0.7em !important;
}

#lobby-invite {
    background-color: #000000;
    text-align: center;
}

#lobby-mods {}

#lobby-mod-selection {}

.lobby-mod-selector-label {
    font-size: 0.8em;
}

/* DIV CONTAINING RADIO BUTTON AND MOD NAME */
.lobby-mod-selector {
    border: 1;
    font-size: 0.8em;
    font-weight: bold;
}

.lobby-game-invite-btn {
    font-size: 0.8em;
}

/* Game invite accept dialog */
#lobby-invite-request {
    font-family: Georgia, Times, "Times New Roman", serif;
    font-size: 1.3em;
    text-align: center;
    background-color: #0033CC;
    color: #EEEEEE;
    border-top-color: #FFFFFF;
    vertical-align: middle;
}
</style>
