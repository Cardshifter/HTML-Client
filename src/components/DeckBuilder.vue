<template>
  <div>
    <div v-if="!doneLoading">
        <h1>Loading Deck Builder...</h1>
    </div>
    <div v-if="doneLoading">
        <!-- DECK HEADER -->
        <h1>Deck name: {{deckName}}</h1>
        <h2>{{totalSelected}} / {{maxCards}}</h2>

        <!-- Deck manipulation & `Start game` | `Back to lobby` controls -->
        <form>
            <!-- TODO: {Phrancis} Lay this out in a nice Bootstrap form. -->
            <label>Save deck as:</label>
            <input v-model="deckName" type="text" />
            <input @click="saveDeck()" type="button" value="Save Deck" class="btn btn-xs btn-primary"/>
            <br/>
            <input v-if="enteringGame" @click="enterGame()" type="button" value = "Start game" class="btn btn-sm btn-success"/>
            <input v-if="enteringGame" @click="goBack()" type="button" value="Go back to lobby" class="btn btn-sm btn-default"/>
        </form>

        <!-- List of saved decks, with `Delete` button -->
        <ul>
            <li v-for="deck in savedDecks">
                <span class="load-deck" @click="switchDeck(deck)">{{deck.name}}</span>
                <input @click="deleteDeck(deck.name)" type="button" value="Delete" class="btn btn-xs btn-danger"/>
            </li>
        </ul>

        <ul>
            <card card-info="cardInfo" v-if="cardInfo"></card>
        </ul>

        <!-- LIST OF ALL CARDS - Displays one full row below for every card -->
            <!-- Available {{card.properties}} values
                SERVER JSON name      | AngularJS ref name | Note
                -------------------------------------------------
                "SICKNESS"            | SICKNESS           | 1 or 0, or empty (for cards where n/a)
                "MANA_COST"           | MANA_COST          | n, or empty (for cards n/a)
                "ATTACK"              | ATTACK             | n, or empty (for cards n/a)
                "HEALTH"              | HEALTH             | n, or empty (for cards n/a)
                "ATTACK_AVAILABLE"    | ATTACK_AVAILABLE   | 1, or empty (when explicit 0 n/a)
                "flavor"              | flavor             | flavor, or empty
                "name"                | name               | name (cannot be empty)
                "description"         | effect             | effect, or empty
                "type"                | creatureType       | type, or empty (for non-creatures)
                "MAX_HEALTH"          | MAX_HEALTH         | n, or empty (for cards n/a)
                "SCRAP"               | SCRAP              | n, or empty (for cards n/a)
                "SCRAP_COST"          | SCRAP_COST         | n, or empty (for cards n/a)
            -->
        <table>
            <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Count</th>
                <th>Mana</th>
                <th>A / H</th>
                <th>Sick</th>
                <th>Akt?</th>
                <th>FX</th>
                <th>?</th>
            </tr>
            <tr v-for="card in cards">
                <td>{{card.properties.creatureType}}</td>
                <td><a href @click="showDetails(card)">{{card.properties.name}}</a></td>
                <td style="text-align: center;">
                <!-- Controls to add or remove a card to deck, and counter to show "current / max" count -->
                    <div class="btn-group">
                        <!-- MINUS button -->
                        <button @click="decrement(card)" type="button" class="btn btn-xs btn-default glyphicon glyphicon-minus"></button>
                        <!-- How many cards you selected for this deck, and what the max allowed is -->
                        <button type="button" class="btn btn-xs btn-default"><b :data-count="currentDeck[card.properties.id]">{{currentDeck[card.properties.id] || 0}} / {{card.max}}</b></button>
                        <!-- PLUS button -->
                        <button @click="increment(card)" type="button" class="btn btn-xs btn-default glyphicon glyphicon-plus"></button>
                    </div>
                </td>
                <td style="text-align: center;">{{card.properties.MANA_COST}}</td>
                <td style="font-weight: bold; text-align: center;">
                    <span v-if="card.properties.ATTACK" style="font-size: 1.0em;">{{card.properties.ATTACK}}</span>
                    <span v-if="!card.properties.ATTACK" style="font-size: 1.0em; color: red;">-</span>
                    <span>/</span>
                    <span v-if="card.properties.HEALTH" style="font-size: 1.0em;">{{card.properties.HEALTH}}</span>
                    <span v-if="!card.properties.HEALTH" style="font-size: 1.0em; color: red;">-</span>
                </td>
                <td style="text-align: center;">{{card.properties.SICKNESS}}</td>
                <td style="text-align: center;">
                    <span v-if="card.properties.ATTACK_AVAILABLE" style="font-size: 0.8em; color: green;">Yes</span>
                    <span v-if="!card.properties.ATTACK_AVAILABLE" style="font-size: 0.8em; color: red;">No</span>
                </td>
                <td style="text-align: center;"><!-- effect popover -->
                    <button type="button" class="btn btn-xs btn-default" popover-placement="top"
                            :popover="card.properties.effect" :popover-title="card.properties.name"
                            v-if="card.properties.effect">FX</button>
                </td>
                <td style="text-align: center;"><!-- flavor tooltip -->
                    <button type="button" class="btn btn-xs btn-default" popover-placement="right"
                            :popover="card.properties.flavor"
                            v-if="card.properties.flavor">?</button>
                </td>
            </tr>
        </table>
    </div>
</div>
</template>
<script>
import CardshifterServerAPI from "../server_interface";
import State from "../State";

const DECK_STORAGE = "CARDSHIFTER_DECK_STORAGE";

export default {
  name: "DeckBuilder",
  props: ["currentUser"],
  data() {
    return {
      doneLoading: false,
      deckConfig: null,
      cards: [],
      maxCards: 0,
      minCards: 0,
      currentDeck: {},
      cardInfo: null,
      deckName: "untitled",
      currentDeckName: "untitled",
      savedDecks: [],
      doneLoading: false,
      enteringGame: null
    }
  },
  methods: {
    playerconfig(cardInformation) {
        this.deckConfig = cardInformation;
        var deck = cardInformation.configs.Deck;

        for (var card in deck.cardData) {
          this.cards.push(deck.cardData[card]);
          if (deck.cardData.hasOwnProperty(card)) {
              deck.cardData[card].max = deck.max[card] || deck.maxPerCard;
              this.$set(this.currentDeck, deck.cardData[card].properties.id, 0);
          }
        }

        this.cards.sort((a, b) => a.id - b.id);

        this.maxCards = deck.maxSize;
        this.minCards = deck.minSize;
        this.updateSavedDecks();
        this.doneLoading = true;
    },


    /**
    * This is called when the minus-sign button for a card
    * has been clicked.
    *
    * This function will, based on the argument, will reduce
    * the amount of this card the user has by one. This can
    * not go below 0.
    *
    * @param card:Object -- The card to decrement
    */
    decrement(card) {
        if (this.currentDeck[card.properties.id] > 0) {
            this.currentDeck[card.properties.id]--;
        }
    },
    /**
    * This is called when the plus-sign button for a card
    * has been clicked.
    *
    * This function will, based on the argument, will
    * increase the amount of this card the user has by one.
    *
    * This can not go above the card's maximum limit, nor
    * can it go above the deck limit.
    *
    * @param card:Object -- The card to increment
    */
    increment(card) {
        if (this.totalSelected < this.maxCards &&
           this.currentDeck[card.properties.id] !== card.max) {
            this.currentDeck[card.properties.id]++;
        }
    },

    /**
    * This is called when the card link of a card in the
    * available cards table has been clicked.
    *
    * Once this function is called, it loads this.cardInfo
    * with the card object associated with the link that was
    * clicked and will simply stick it into a card directive
    * which is displayed at the top of the screen.
    *
    * TODO: Dynamically load this.cardInfo with card properties. #60
    */
    showDetails(card) {
      this.cardInfo = card;
    },

    /**
    * This is called by the "save deck" button at the bottom of the
    * screen. This function stores all the currently selected cards
    * in Local Storage.
    *
    * If the user has not selected enough cards, not given the deck
    * a name, or has given it name but it already exists, this function
    * will stop immediately.
    */
    saveDeck() {
        if (this.totalSelected < this.minCards) {
            ErrorCreator.create("Not enough cards");
            console.log("not enough cards");
            return;
        }
        if (!this.deckName) {
            ErrorCreator.create("Please enter a name");
            console.log("enter name");
            return;
        }
        if (this.getDeckIndex(this.deckName)) {
            ErrorCreator.create("A deck with that name already exists");
            console.log("deck already exists");
            return;
        }

        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));

        var newDeck = {
            name: this.deckName,
            cards: this.currentDeck
        };

        savedDecks.decks[this.currentUser.game.mod].push(newDeck);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));
        this.updateSavedDecks();

        this.switchDeck(newDeck);
    },

    /**
    * This function is called when the deck link of a deck
    * is clicked. This function will load the deck information
    * from Local Storage and display it on the screen in the
    * card table.
    *
    * @param deck:Object -- The deck to load
    */
    switchDeck(deck) {
        this.currentDeckName = deck.name;
        this.currentDeck = deck.cards;
    },

    /**
    * This function is called when the "delete" button next
    * to a deck name near the bottom of the page is clicked.
    *
    * This function will remove the specified deck from
    * Local Storage, and from the list at the bottom of the
    * screen.
    *
    * @param deckName:string -- The name of the deck to delete
    */
    deleteDeck(deckName) {
        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));
        savedDecks.decks[this.currentUser.game.mod].splice(getDeckIndex(deckName), 1);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));

        this.updateSavedDecks();
    },

    /**
    * This function is called when the "start game" button near the
    * bottom of the page is clicked. This function will not run
    * if the user has not selected enough cards.
    *
    * The "start game" button is only displayed if this deck builder
    * screen was opened via starting a new game from the lobby.
    *
    * This function will send all the deck information to the server
    * and then redirect to the game board screen.
    */
    enterGame() {
        if (this.totalSelected === this.minCards) {
            // remove all .max properties so server does not die
            for (var card in this.deckConfig.configs.Deck.cardData) {
                delete this.deckConfig.configs.Deck.cardData[card].max;
            }

            this.deckConfig.configs.Deck.chosen = this.currentDeck;
            let deckConfigCopy = {
              command: "playerconfig",
              configs: this.deckConfig.configs,
              gameId: this.deckConfig.gameId,
              modName: this.deckConfig.modName
            }
            CardshifterServerAPI.sendMessage(deckConfigCopy);

            this.$router.push({ name: 'GameBoard', params: {
              currentUser: this.currentUser
            }});
        } else {
            ErrorCreator.create("Not enough cards");
            console.log("not enough cards");
        }
    },

    /**
    * This function is called once the "go back to the lobby" button
    * near the bottom of the page is clicked.
    *
    * This button is only visible if the deck builder was entered
    * via the "deck builder" button in the game lobby.
    *
    * This function simply redirects the page back to the lobby
    * screen.
    */
    goBack() {
        this.$router.go(-1);
    },

    /**
    * This function updates the this variable savedDecks with the
    * saved decks that are stored in Local Storage.
    *
    * This function will only load this.savedDecks with the decks of
    * the mod that the game or user specified.
    */
    updateSavedDecks() {
        this.savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE)).decks[this.currentUser.game.mod];
    },

    /**
    * This function will search through all the saved decks in
    * this.savedDecks and try to find the deck with the name
    * deckName.
    *
    * @param deckName:string -- The name of the deck to look for.
    * @return number/boolean -- The index of the deck with the correct name in this.savedDecks
    *                        -- false if the deck was not found in this.savedDecks
    */
    getDeckIndex(deckName) {
        for(var i = 0, length = this.savedDecks.length; i < length; i++) {
            if (this.savedDecks[i].name === deckName) {
                return i;
            }
        }
        return false;
    }
  },
  created() {
    this.enteringGame = this.currentUser.game.id;
    CardshifterServerAPI.$on("type:playerconfig", this.playerconfig);

    const preloadedDecks = {"decks":
        {
            "Mythos":[
                {
                    "name":"Chinese Focus",
                    "cards":{"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"18":1,"19":1,"20":1,"21":1,"25":2,"26":2,"27":2,"30":1,"31":2,"32":2,"33":2,"34":2,"35":2}
                },{
                    "name":"Greek Classic",
                    "cards":{"36":1,"37":1,"38":1,"39":1,"40":1,"41":1,"42":1,"43":1,"44":1,"45":1,"46":1,"61":1,"68":1,"69":1,"70":1,"71":1,"72":1,"73":1,"74":1,"75":1,"76":1,"78":1,"79":1,"80":1,"82":1,"85":1,"93":1,"94":1,"97":1,"98":1}
                },{
                    "name":"Greek Dark",
                    "cards":{"9":1,"12":2,"16":2,"17":2,"47":1,"48":1,"49":1,"50":1,"51":1,"52":1,"53":1,"54":1,"55":1,"56":1,"57":1,"58":1,"59":1,"60":1,"62":1,"63":1,"64":1,"65":1,"66":1,"67":1,"95":1,"96":1,"98":1}
                },{
                    "name":"Hindu Focus",
                    "cards":{"3":1,"4":1,"5":1,"6":2,"7":2,"8":2,"9":2,"10":2,"11":1,"12":1,"16":1,"17":1,"18":1,"99":1,"101":1,"103":1,"104":1,"105":1,"106":1,"107":1,"108":1,"109":3,"110":1}
                }
            ],"Cyborg-Chronicles":[
                {
                    "name":"Balanced",
                    "cards":{"3":1,"4":1,"5":1,"6":1,"7":1,"8":2,"10":1,"12":2,"14":1,"16":1,"17":1,"19":1,"20":2,"21":1,"22":1,"23":1,"24":1,"25":2,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1,"35":1,"36":1}
                },{
                    "name":"Defensive",
                    "cards":{"3":1,"4":1,"6":2,"7":1,"9":1,"10":2,"12":1,"13":1,"15":2,"16":1,"17":1,"18":1,"19":2,"20":1,"21":2,"22":1,"24":2,"25":1,"26":1,"27":1,"29":1,"32":1,"34":1,"35":1}
                }
            ]
        }
    };

    if(!localStorage.getItem(DECK_STORAGE)) {
//        var mods = {};
//        for (var i in availableGameMods) {
//            mods[availableGameMods[i]] = [];
//        }
//        var json = JSON.stringify({
//            decks: mods
//        });
//        localStorage.setItem(DECK_STORAGE, json);
      localStorage.setItem(DECK_STORAGE, JSON.stringify(preloadedDecks));
    }
  },
  computed: {
    totalSelected: function() {
      var total = 0;
      for (var card in this.currentDeck) {
          if (this.currentDeck.hasOwnProperty(card)) {
              total += this.currentDeck[card];
          }
      }
      return total;
    }
  },
  beforeDestroy() {
    CardshifterServerAPI.$off("type:playerconfig", this.playerconfig);
  }
}
</script>
<style>
.load-deck {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
  cursor: pointer;
}
</style>
