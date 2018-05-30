<template>
    <div class="properties player-info-box">
        <h4 style="font-weight: bold;" @click="selectEntity(info)"
            :class="{'selected': info.selected, 'targetable': currentAction !== null && targets.indexOf(info.id) !== -1}">
            {{info.name}}
        </h4>
        <ul style="list-style: none outside none; margin: 0; padding: 0;">
            <Value :value="info.properties.HEALTH" :valueMax="info.properties.MAX_HEALTH" type="health" alwaysShow></Value>
            <Value :value="info.properties.MANA" :valueMax="info.properties.MAX_MANA" type="mana" alwaysShow></Value>
            <Value :value="info.properties.SCRAP" type="scrap"></Value>
            <li v-for="(value, name) in otherPlayerData" :key="name">
                <span style="font-weight: bold; font-size: 1.0em;">
                    {{name | formatResourceName}}:
                </span>
                <span style="font-size: 1.0em;">
                    {{value}}
                </span>
            </li>
            <!-- CARDS -->
            <li>
                <span style="font-weight: bold; font-size: 1.0em;">
                    Cards:
                </span>
                <span style="font-size: 1.0em;">
                    {{ info.zones.Hand ? info.zones.Hand.length() : "?" }}
                </span>
            </li>
        </ul>
        <!-- Action buttons -->
        <div class="player-actions">
            <div v-for="action in actions" v-if="action.isPlayer && action.id == info.id" :key="action.action">
                <input @click="startAction(action)" v-show="currentAction === null" type="button" :value="action.action"
                       class="btn btn-navbar csh-button"/>
            </div>
            <div v-show="showActions && currentAction != null">
                <input @click="cancelAction()" type="button" value="Cancel"
                       class="btn btn-navbar csh-button"/>
                <input @click="performAction()" type="button" :value="currentAction ? currentAction.action : '(None)'"
                       class="btn btn-navbar csh-button"/>
            </div>
        </div>
    </div>
</template>
<script>
import Value from "./Value";

export default {
  name: "PlayerInfo",
  props: ["info", "actions", "targets", "showActions", "currentAction", "selectEntity", "startAction", "cancelAction", "performAction"],
  filters: {
    formatResourceName: function(input) {
        input = input.replace(/_/g, ' ');
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
  },
  components: {
    Value
  },
  computed: {
      /**
       * Arranges raw player data from the game server into an object
       * without the data that has explicit rendering in the template.
       * For making a generic list of resources.
       *
       * @return {Object} Data without health, mana, and scrap
       */
      otherPlayerData() {
          const result = Object.assign({}, this.info.properties);
          delete result.HEALTH;
          delete result.MAX_HEALTH;
          delete result.MANA;
          delete result.MAX_MANA;
          delete result.SCRAP;
          return result;
      }
  }
}
</script>
