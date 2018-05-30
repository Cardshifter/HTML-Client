<template>
    <div>
        <TopNavbar :username="currentUser.username"></TopNavbar>
          <div class="game" :class="'game-' + modName">
              <!-- Player display -->
              <div>
                  <b-alert :show="eliminationResult !== null">
                    <span>{{ eliminationResult }}</span>
                    <button @click="gotoLobby()">Back to Lobby</button>
                  </b-alert>

                  <b-alert dismissible variant="danger" @dismissed="errorMessage = null" :show="errorMessage !== null">{{ errorMessage }}</b-alert>

                  <div v-for="(info, type) in playerInfos" class="player" :key="type"
                      :class="{'player-user': info == playerInfos.user, 'player-opponent': info != playerInfos.user}">

                      <!-- Player information boxes -->
                      <PlayerInfo :info="info" :currentAction="currentAction"
                        :targets="targets"
                        :actions="actions" :selectEntity="selectEntity" :startAction="startAction" :cancelAction="cancelAction" :performAction="performAction"
                        :showActions="info == playerInfos.user">

                      </PlayerInfo>

                      <!-- Player cards -->
                      <div v-for="(zoneInfo, zoneName) in info.zones" class="zone" :class="'zone-' + zoneName" :key="zoneName">
                          <transition-group v-if="zoneInfo.known" name="list-complete" tag="div">
                              <!--<h3>{{zoneName}}</h3>-->
                              <CardModel class="list-complete-item" :card="card" :targets="targets" :doingAction="doingAction"
                                  :selectEntity="selectEntity" :actions="actions" :startAction="startAction"
                                  v-for="(card, id) in zoneInfo.entities" :key="id" v-if="card.properties">
                              </CardModel>
                          </transition-group>

                          <!-- For opponent's cards. Is there a better way? -->
                          <div v-show="!zoneInfo.known && zoneName==='Hand'">
                              <!--<h3>{{zoneName}}</h3>-->
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
</template>
<script>
import CardshifterServerAPI from "../server_interface";
import TopNavbar from "./TopNavbar";
import CardModel from "./CardModel"
import PlayerInfo from "./PlayerInfo"

export default {
  name: "GameBoard",
  props: ["currentUser"],
  data() {
    return {
      modName: this.currentUser.game.mod.toLowerCase().replace(' ', '-'),
      eliminationResult: null,
      cardZones: {}, // contains information about what card is where.
      actions: [],
      errorMessage: null,
      doingAction: false,
      playerInfos: {
          user: {
              index: null,
              id: null,
              name: null,
              animations: {},
              properties: {},
              zones: {}
          },
          opponent: {
              index: null,
              id: null,
              name: null,
              animations: {},
              properties: {},
              zones: {}
          }
      },
      targets: [],
      selected: [],
      currentAction: null
    }
  },
  components: {
      TopNavbar,
      PlayerInfo,
      CardModel
  },
  methods: {
    startAction(action) {
        if (!action.targetRequired) { // No targets, no confirmation.
            this.currentAction = action;
			      var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(this.currentUser.game.id,
								this.currentAction.id, this.currentAction.action);

            CardshifterServerAPI.sendMessage(doAbility);
			      this.cancelAction();
            return;
        }

		    // if a target is required, request targets
		    var getTargets = new CardshifterServerAPI.messageTypes.RequestTargetsMessage(this.currentUser.game.id,
				      action.id, action.action);
        CardshifterServerAPI.sendMessage(getTargets);

        this.currentAction = action;
        this.doingAction = true;
    },

    cancelAction() {
        this.doingAction = false;
        this.currentAction = null;
        this.targets = [];
        for (var i = 0; i < this.selected.length; i++) {
            this.selected[i].selected = false;
        }
        this.selected = [];
    },

    gotoLobby() {
        this.$router.push({
            name: 'Lobby',
            params: {
                currentUser: this.currentUser
            }
        });
    },

    performAction() {
		    var action = this.currentAction;
		    var selected = this.selected;
		    var minTargets = this.targetsMessage.min;
		    var maxTargets = this.targetsMessage.max;
		    if (selected.length < minTargets || selected.length > maxTargets) {
			      console.log("target(s) required: " + minTargets + " - " + maxTargets + " but chosen " + selected.length);
			      this.errorMessage = "target(s) required: " + minTargets + " - " + maxTargets + " but chosen " + selected.length;
            return;
		    }

        var doAbility = null;
		    var selectedIDs = [];
		    for (var i = 0, length = this.selected.length; i < length; i++) {
			       selectedIDs.push(this.selected[i].id);
		    }

		    var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(this.currentUser.game.id,
					this.currentAction.id, this.currentAction.action, selectedIDs);

        CardshifterServerAPI.sendMessage(doAbility);
        this.cancelAction();
    },

    selectEntity(entity) {
        if (!this.doingAction) {
            return;
        }
        var selected = this.selected;
        var index = selected.indexOf(entity);

        if(index === -1) {      // select
            selected.push(entity);
            this.$set(entity, 'selected', true);
        } else {                // de-select
            selected.splice(index, 1);
            this.$set(entity, 'selected', false);
        }

        // if action requires exactly one target, perform action when target is chosen
        if (this.targetsMessage.min === 1 && this.targetsMessage.max === 1) {
            this.performAction();
        }
    },


    /**
    * Resets all the available actions that the user has.
    */
    resetActions() {
        this.actions = [];
    },

    /**
    * Adds another possible action to the possible actions
    * that this user can complete on their turn.
    *
    * @param action:UsableActionMessage -- The action to add
    *
    * This will only add the action to this.actions if there
    * is not another action with the same name in there.
    */
    addUsableAction(action) {
        var actions = this.actions;

        if (this.findPlayer(action.id)) { // ID is not target
            action.isPlayer = true;
            var notDuplicate = true;

            for(var i = 0, length = actions.length; i < length; i++) {
                if(actions[i].action === action.action) { // not a duplicate
                    notDuplicate = false;
                    break;
                }
            }

            if(notDuplicate) {
                actions.push(action);
            }
        } else { // ID is target
            action.isPlayer = false;
            actions.push(action);
        }
    },

    /**
    * Stores the information in player into either
    * playerInfos.user if this user is being
    * described in the message, or playerInfos.opponent
    * if the opponent is being described in the message.
    *
    * @param player:PlayerMessage -- The player info to store
    *
    */
    storePlayerInfo(player) {
        var playerInfo;

        if (player.index === this.currentUser.game.playerIndex) {
            playerInfo = this.playerInfos.user;
        } else {
            playerInfo = this.playerInfos.opponent;
        }

        playerInfo.index = player.index;
        playerInfo.id = player.id;
        playerInfo.name = player.name;

        this.$set(playerInfo, 'properties', player.properties);
    },

    /**
    * Stores the information about a zone by the
    * zone's name in
    * playerInfos.<player>.zones.<zone_name>
    *
    * @param zone:ZoneMessage -- The zone to add
    *
    * This will skip all "Cards" messages.
    */
    setZone(zone) {
        if (zone.name === "Cards") { // "Not currently used as it is too meta."
            return;
        }

        for (var player in this.playerInfos) {
            if (this.playerInfos.hasOwnProperty(player)) {
                if (this.playerInfos[player].id === zone.owner) {
                    var newEntities = {};
                    for(var i = 0, length = zone.entities.length; i < length; i++) {
                        var entityId = zone.entities[i];
                        this.$set(newEntities, entityId, {});
                        this.$set(this.cardZones, entityId, zone.id);
                    }
                    this.$set(zone, 'entities', newEntities);
					          zone.length = function () {
						          return Object.keys(zone.entities).length;
					          }

                    this.$set(this.playerInfos[player].zones, zone.name, zone);
                    break;
                }
            }
        }
    },

    /**
    * Stores a CardInfoMessage in the appropriate zone,
    * which is going to be in either the user's zones, or
    * the opponent's zones.
    *
    * @param card:CardInfoMessage -- The card to store.
    *
    * This function will not store the CardInfoMessage if the
    * zone is not ".known".
    */
    storeCard(card) {
        var destinationZone = this.findZone(card.zone);
        card.animations = {};

        try {
            if(destinationZone.known) {
              this.$set(destinationZone.entities, card.id, card);
            }
        } catch(e) {
            /* Do nothing. The reason why an error
            * might occur probably has something to
            * do with how the server is sending messages.
            *
            * For Mythos, 10 cards are sent: two groups of
            * 5. Both groups are identical. However, the
            * first group will always fail.
            *
            * The reason for this is because Mythos will send
            * CardInfoMessages before it has sent the
            * ZoneMessages, which means that this function
            * won't know where to put the cards. However,
            * since the initial ZoneChangeMessages and
            * CardInfoMessages in Mythos don't matter, it is
            * safe to ignore this error.
            */
        }
    },

    /**
    * Moves a single card from one zone to another
    *
    * @param message:ZoneChangeMessage -- The zone change information
    *
    */
    moveCard(message) {
        try {
            var src = this.findZone(message.sourceZone);
            var dest = this.findZone(message.destinationZone);
            var card = null;
            // when a card is suddenly summoned, sourceZone is -1, which doesn't exist
            if (src) {
                card = src.entities[message.entity];
                delete src.entities[message.entity];
            }
            this.$set(this.cardZones, message.entity, message.destinationZone);
            this.$set(dest.entities, message.entity, card);
        } catch(e) {
            /*
            * See the try/catch in storeCard.
            */
        }
    },

    /**
    * Removes a card from the zone it is in
    *
    * @param message:EntityRemoveMessage -- Remove information
    */
    removeEntity(message) {
		    var entityId = message.entity;
        var zoneId = this.cardZones[entityId];
        var zone = this.findZone(zoneId);
        delete zone.entities[entityId];
        delete this.cardZones[entityId];
    },

    /**
    * Sets the this.targets to all the available
    * targets for the current action.
    *
    * @param targets:AvailableTargetsMessage -- The available targets
    *
    * The HTML, depending on this this.targets value, will turn
    * a card name into a link for the user to select.
    */
    setTargets(targets) {
        this.targets = targets.targets;
		    this.targetsMessage = targets;
    },

    /**
    * Updates properties based on the message received.
    *
    * @param toUpdate:UpdateMessage -- The information on what to update
    *
    */
    updateProperties(toUpdate) {
        var entity = this.findEntity(toUpdate.id);
        if (!entity) {
            // this can happen when Server sends update message before CardInfoMessage
            return;
        }
        if (!entity.properties) {
            // this can happen when Server sends update message before CardInfoMessage
            return;
        }
        var oldValue = entity.properties[toUpdate.key];
        this.$set(entity.properties, toUpdate.key, toUpdate.value);
        if (typeof toUpdate.value === 'number') {
            var diff = toUpdate.value - oldValue;
            if (!entity.animations) {
                entity.animations = {};
            }
            var anim = entity.animations[toUpdate.key];
            var animObject = { diff: diff };
            if (anim) {
                anim.push(animObject);
            } else {
                this.$set(entity.animations, toUpdate.key, [ animObject ]);
            }
        }
    },

    /**
    * Displays the winner to the user and then navigates back
    * to the lobby.
    *
    * @param elimination:PlayerEliminatedMessage -- The elimination information
    *
    */
    displayWinner(elimination) {
        var id = elimination.id;
        var winner = elimination.winner;
        var results = "You ";

        if (this.findPlayer(id) !== this.playerInfos.user) {
            return; // avoid showing modal twice
        }

        if (winner) {
            results += "win";
        } else {
            results += "lose";
        }
        this.eliminationResult = results;
    },

    /**
    * Return the zone of the passed in ID.
    *
    * @param id:number -- The ID of the zone.
    * @return Object -- The zone
    *                -- null, if a zone with id doesn't exist
    */
    findZone(id) {
        var zoneGroups = [this.playerInfos.user.zones, this.playerInfos.opponent.zones];

        for(var i = 0, length = zoneGroups.length; i < length; i++) {
            for(var zone in zoneGroups[i]) {
                if(zoneGroups[i].hasOwnProperty(zone)) {
                    if(zoneGroups[i][zone].id === id) {
                        return zoneGroups[i][zone];
                    }
                }
            }
        }
        return null;
    },
    /**
    * Finds and returns a player based on an ID
    *
    * @param id:number -- The ID of the player
    * @param Object -- playerInfos.user
    *               -- playerInfos.opponent
    *               -- null, if the ID does not belong to either player
    */
    findPlayer(id) {
        if(id === this.playerInfos.user.id) {
            return this.playerInfos.user;
        } else if(id === this.playerInfos.opponent.id) {
            return this.playerInfos.opponent;
        }
        return null;
    },

    /**
    * Finds and returns an entity based on an ID
    *
    * @param id:number -- The ID of the entity
    * @param Object -- playerInfos.user or playerInfos.opponent
    *               -- a card object
    *               -- null, if no entity with that ID was found
    */
    findEntity(id) {
        var player = this.findPlayer(id);
        if (player) {
            return player;
        } else {
            var zoneId = this.cardZones[id];
            var zone = this.findZone(zoneId);
            if (!zone) {
                console.log('unable to find entity ' + id + ', last known zone not found: ' + zoneId);
                return null;
            }
            if (zone.entities[id]) {
                return zone.entities[id];
            }
        }
        return null;
    },

    displayError(message) {
        this.errorMessage = message.message;
    }
  },
  created() {
    CardshifterServerAPI.$on("type:resetActions", this.resetActions);
    CardshifterServerAPI.$on("type:useable", this.addUsableAction);
    CardshifterServerAPI.$on("type:player", this.storePlayerInfo);
    CardshifterServerAPI.$on("type:zone", this.setZone);
    CardshifterServerAPI.$on("type:entityRemoved", this.removeEntity);
    CardshifterServerAPI.$on("type:card", this.storeCard);
    CardshifterServerAPI.$on("type:zoneChange", this.moveCard);
    CardshifterServerAPI.$on("type:targets", this.setTargets);
    CardshifterServerAPI.$on("type:update", this.updateProperties);
    CardshifterServerAPI.$on("type:elimination", this.displayWinner);
    CardshifterServerAPI.$on("type:error", this.displayError);
  },
  computed: {

  },
  beforeDestroy() {
    CardshifterServerAPI.$off("type:resetActions", this.resetActions);
    CardshifterServerAPI.$off("type:useable", this.addUsableAction);
    CardshifterServerAPI.$off("type:player", this.storePlayerInfo);
    CardshifterServerAPI.$off("type:zone", this.setZone);
    CardshifterServerAPI.$off("type:entityRemoved", this.removeEntity);
    CardshifterServerAPI.$off("type:card", this.storeCard);
    CardshifterServerAPI.$off("type:zoneChange", this.moveCard);
    CardshifterServerAPI.$off("type:targets", this.setTargets);
    CardshifterServerAPI.$off("type:update", this.updateProperties);
    CardshifterServerAPI.$off("type:elimination", this.displayWinner);
    CardshifterServerAPI.$off("type:error", this.displayError);
  }
}
</script>
