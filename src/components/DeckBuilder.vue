<template>
  <div>
    <div v-if="!doneLoading">
        <h1 class="deckbuilder-deck-name">Loading Deck Builder...</h1>
    </div>
    <div v-if="doneLoading">
        <!-- DECK HEADER -->
        <h1 class="deckbuilder-deck-name">Deck name: {{deckName}}</h1>
        <h2 class="deckbuilder-deck-card-count">{{totalSelected}} / {{maxCards}}</h2>

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
            <CardModel :card="cardInfo" v-if="cardInfo"></CardModel>
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
        <table class="deckbuilder-card-table">
            <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Count</th>
                <th>Mana</th>
                <th style="width: 100px">A / H</th>
                <th>Sick</th>
                <th>Akt?</th>
                <th>FX</th>
                <th>?</th>
            </tr>
            <tr v-for="card in cards">
                <td>{{card.properties.creatureType}}</td>
                <td><a href @click.prevent="showDetails(card)">{{card.properties.name}}</a></td>
                <td style="text-align: center;">
                <!-- Controls to add or remove a card to deck, and counter to show "current / max" count -->
                    <div class="btn-group">
                        <!-- MINUS button -->
                        <button @click="decrement(card)" type="button" class="btn btn-xs btn-default fa fa-minus"></button>
                        <!-- How many cards you selected for this deck, and what the max allowed is -->
                        <button type="button" class="btn btn-xs btn-default"><b :data-count="currentDeck[card.properties.id]">{{currentDeck[card.properties.id] || 0}} / {{card.max}}</b></button>
                        <!-- PLUS button -->
                        <button @click="increment(card)" type="button" class="btn btn-xs btn-default fa fa-plus"></button>
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
                <td style="text-align: center;">
                    {{card.properties.effect}}
                </td>
                <td style="text-align: center;"><!-- flavor tooltip -->
                    <b-btn type="button" class="btn btn-xs btn-default" popover-placement="right"
                            v-b-popover.hover="card.properties.flavor"
                            v-if="card.properties.flavor">?</b-btn>
                </td>
            </tr>
        </table>
    </div>
</div>
</template>
<script>
import CardshifterServerAPI from "../server_interface";
import CardModel from "./CardModel"

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
  components: {
    CardModel
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

        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));

        var newDeck = {
            name: this.deckName,
            cards: this.currentDeck
        };

        let deckIndex = this.getDeckIndex(this.deckName);
        if (deckIndex) {
          savedDecks.decks[this.currentUser.game.mod][deckIndex] = newDeck;
        } else {
          savedDecks.decks[this.currentUser.game.mod].push(newDeck);
        }
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
        savedDecks.decks[this.currentUser.game.mod].splice(this.getDeckIndex(deckName), 1);
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
        this.$router.push({ name: 'Lobby', params: { currentUser: this.currentUser }});
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

    const preloadedDecks = {
        "decks":{
            "Mythos":[
                {
                    "name":"Greek Classic",
                    "cards":{ "ninja-spy":0,"odysseus":1,"shaman":0,"assassin":0,"monking":0,"persephone":0,"caucasian-eagle":1,"cerberus":0,"poseidon":1,"hades'-bident":0,"tartarus":0,"durga":0,"achilles'-shield":0,"thanatos":0,"apollo":1,"mnemosyne":0,"guanyin":0,"zeus":1,"hyperion":0,"empusa":0,"athena":1,"maitreya-buddha":0,"tartarean-pit":0,"gaia":1,"poseidon's-trident":0,"diyu":0,"gautama-buddha":0,"longbowman":0,"vishnu":0,"helm-of-darkness":0,"guan-yu":0,"golden-fleece":0,"charon":0,"arachne":0,"rhea":0,"krishna":0,"styx":0,"ajax-the-great":1,"chiron":0,"archer":0,"terracotta-soldier":0,"eros":1,"mount-olympus":1,"defender":1,"perseus":1,"iolaus":1,"the-underworld":0,"medusa":0,"varuna":0,"pegasus":1,"judges-of-the-dead":0,"skeleton":0,"undead":0,"hermes":1,"nemean-lion":1,"achilles":1,"pikeman":0,"hades":0,"heracles":1,"healer":1,"yama":0,"hector":1,"lamia":0,"ares":1,"uranus":1,"indra":0,"eight-immortals":0,"holy-man":0,"kung-fu-fighter":0,"cronus":0,"erymanthian-boar":1,"shiva":0,"hera":1,"shinje":0,"cronus'-scythe":0,"daedalus":1,"nuwa":0,"artemis":1,"griffin":1,"brahma":0,"slinger":1,"jade-emperor":0,"lernaean-hydra":0,"menoetius":0,"theseus":1,"manchu-archer":0,"macaria":0,"swordsman":1,"hecate":0,"mazu":0,"moirai":0
                    }
                },
                {
                    "name":"Greek Dark",
                    "cards":{"ninja-spy":0,"odysseus":0,"shaman":0,"assassin":1,"monking":0,"persephone":1,"caucasian-eagle":0,"cerberus":1,"poseidon":0,"hades'-bident":1,"tartarus":1,"durga":0,"achilles'-shield":0,"thanatos":1,"apollo":0,"mnemosyne":1,"guanyin":0,"zeus":0,"hyperion":1,"empusa":1,"athena":0,"maitreya-buddha":0,"tartarean-pit":1,"gaia":0,"poseidon's-trident":0,"diyu":0,"gautama-buddha":0,"longbowman":0,"vishnu":0,"helm-of-darkness":1,"guan-yu":0,"golden-fleece":0,"charon":1,"arachne":1,"rhea":1,"krishna":0,"styx":1,"ajax-the-great":0,"chiron":1,"archer":0,"terracotta-soldier":0,"eros":0,"mount-olympus":0,"defender":0,"perseus":0,"iolaus":0,"the-underworld":0,"medusa":1,"varuna":0,"pegasus":0,"judges-of-the-dead":1,"skeleton":2,"undead":2,"hermes":0,"nemean-lion":0,"achilles":0,"pikeman":0,"hades":1,"heracles":0,"healer":0,"yama":0,"hector":0,"lamia":1,"ares":0,"uranus":0,"indra":0,"eight-immortals":0,"holy-man":0,"kung-fu-fighter":0,"cronus":1,"erymanthian-boar":0,"shiva":0,"hera":0,"shinje":0,"cronus'-scythe":1,"daedalus":0,"nuwa":0,"artemis":0,"griffin":0,"brahma":0,"slinger":0,"jade-emperor":0,"lernaean-hydra":0,"menoetius":1,"theseus":0,"manchu-archer":0,"macaria":1,"swordsman":0,"hecate":1,"mazu":0,"moirai":1
                    }
                },
                {
                    "name":"Chinese Focus",
                    "cards":{"ninja-spy":2,"odysseus":0,"shaman":0,"assassin":1,"monking":2,"persephone":0,"caucasian-eagle":0,"cerberus":0,"poseidon":0,"hades'-bident":0,"tartarus":0,"durga":0,"achilles'-shield":0,"thanatos":0,"apollo":0,"mnemosyne":0,"guanyin":2,"zeus":0,"hyperion":0,"empusa":0,"athena":0,"maitreya-buddha":0,"tartarean-pit":0,"gaia":0,"poseidon's-trident":0,"diyu":1,"gautama-buddha":0,"longbowman":0,"vishnu":0,"helm-of-darkness":0,"guan-yu":2,"golden-fleece":0,"charon":0,"arachne":0,"rhea":0,"krishna":0,"styx":0,"ajax-the-great":0,"chiron":0,"archer":1,"terracotta-soldier":3,"eros":0,"mount-olympus":0,"defender":0,"perseus":0,"iolaus":0,"the-underworld":0,"medusa":0,"varuna":0,"pegasus":0,"judges-of-the-dead":0,"skeleton":0,"undead":0,"hermes":0,"nemean-lion":0,"achilles":0,"pikeman":0,"hades":0,"heracles":0,"healer":0,"yama":0,"hector":0,"lamia":0,"ares":0,"uranus":0,"indra":0,"eight-immortals":3,"holy-man":1,"kung-fu-fighter":3,"cronus":0,"erymanthian-boar":0,"shiva":0,"hera":0,"shinje":1,"cronus'-scythe":0,"daedalus":0,"nuwa":1,"artemis":0,"griffin":0,"brahma":0,"slinger":0,"jade-emperor":1,"lernaean-hydra":0,"menoetius":0,"theseus":0,"manchu-archer":3,"macaria":0,"swordsman":0,"hecate":0,"mazu":3,"moirai":0
                    }
                },
                {
                    "name":"Hindu Focus",
                    "cards":{"ninja-spy":2,"odysseus":0,"shaman":2,"assassin":0,"monking":0,"persephone":0,"caucasian-eagle":0,"cerberus":0,"poseidon":0,"hades'-bident":0,"tartarus":0,"durga":1,"achilles'-shield":0,"thanatos":0,"apollo":0,"mnemosyne":0,"guanyin":0,"zeus":0,"hyperion":0,"empusa":0,"athena":0,"maitreya-buddha":1,"tartarean-pit":0,"gaia":0,"poseidon's-trident":0,"diyu":0,"gautama-buddha":3,"longbowman":1,"vishnu":1,"helm-of-darkness":0,"guan-yu":0,"golden-fleece":0,"charon":0,"arachne":0,"rhea":0,"krishna":1,"styx":0,"ajax-the-great":0,"chiron":0,"archer":1,"terracotta-soldier":0,"eros":0,"mount-olympus":0,"defender":1,"perseus":0,"iolaus":0,"the-underworld":0,"medusa":0,"varuna":1,"pegasus":0,"judges-of-the-dead":0,"skeleton":2,"undead":2,"hermes":0,"nemean-lion":0,"achilles":0,"pikeman":1,"hades":0,"heracles":0,"healer":2,"yama":1,"hector":0,"lamia":0,"ares":0,"uranus":0,"indra":1,"eight-immortals":0,"holy-man":2,"kung-fu-fighter":0,"cronus":0,"erymanthian-boar":0,"shiva":1,"hera":0,"shinje":0,"cronus'-scythe":0,"daedalus":0,"nuwa":0,"artemis":0,"griffin":0,"brahma":1,"slinger":1,"jade-emperor":0,"lernaean-hydra":0,"menoetius":0,"theseus":0,"manchu-archer":0,"macaria":0,"swordsman":1,"hecate":0,"mazu":0,"moirai":0
                    }
                }
            ],
            "Cyborg-Chronicles":[
                {
                    "name":"Balanced",
                    "cards":{"robot-guard":1,"humadroid":1,"scout-mech":1,"steroid-implants":1,"f.m.u.":0,"spareparts":2,"supply-mech":1,"commander":1,"trapped-socket":0,"exoskeleton":0,"bionic-arms":1,"e.m.p.":0,"upgrado-mk-i":1,"shieldmech":1,"longshot":1,"conscript":1,"fortimech":0,"modleg-ambusher":1,"web-boss":1,"the-chopper":2,"wastelander":1,"cyberpimp":0,"artificial-intelligence-implants":1,"heavy-mech":0,"cybernetic-arm-cannon":1,"inside-man":1,"reinforced-cranial-implants":0,"gyrodroid":1,"assassinatrix":1,"body-armor":1,"waste-runner":1,"field-medic":1,"full-body-cybernetics-upgrade":0,"adrenalin-injection":0,"vetter":2,"bodyman":1,"cyborg":1
                    }
                },
                {
                    "name":"Defensive",
                    "cards":{"robot-guard":1,"humadroid":1,"scout-mech":0,"steroid-implants":0,"f.m.u.":1,"spareparts":1,"supply-mech":2,"commander":0,"trapped-socket":0,"exoskeleton":0,"bionic-arms":0,"e.m.p.":0,"upgrado-mk-i":1,"shieldmech":1,"longshot":1,"conscript":1,"fortimech":2,"modleg-ambusher":0,"web-boss":1,"the-chopper":1,"wastelander":1,"cyberpimp":1,"artificial-intelligence-implants":1,"heavy-mech":1,"cybernetic-arm-cannon":1,"inside-man":1,"reinforced-cranial-implants":1,"gyrodroid":1,"assassinatrix":0,"body-armor":1,"waste-runner":1,"field-medic":1,"full-body-cybernetics-upgrade":0,"adrenalin-injection":1,"vetter":2,"bodyman":1,"cyborg":1
                    }
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
  font-size: 0.9em;
}

.deckbuilder-deck-name {
    font-size: 1.6em;
    margin-top: 10px;
}

.deckbuilder-deck-card-count {
    font-size: 1.6em;
}

.deckbuilder-card-table {
    font-size: 0.9em;
}
</style>
