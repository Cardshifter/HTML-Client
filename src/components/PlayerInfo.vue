<template>
    <div class="properties player-info-box">
        <h4 style="font-weight: bold;" @click="selectEntity(info)"
            :class="{'selected': info.selected, 'targetable': currentAction !== null && targets.indexOf(info.id) !== -1}">
            {{info.name}}
        </h4>
        <ul style="list-style: none outside none; margin: 0; padding: 0;">
            <!-- HEALTH & MAX_HEALTH -->
            <li v-for="(value, name) in arrangePlayerData(info.properties)" :key="name">
                <span v-if="name === 'health'" style="font-weight: bold; font-size: 1.0em;">
                    {{name | formatResourceName}}:
                </span>
                <span v-if="name === 'health'" style="font-size: 1.0em;">
                    {{value["current"] + " / " + value["max"]}}
                </span>
            </li>
            <!-- MANA & MAX_MANA -->
            <li v-for="(value, name) in arrangePlayerData(info.properties)" :key="name">
                <span v-if="name === 'mana'" style="font-weight: bold; font-size: 1.0em;">
                    {{name | formatResourceName}}:
                </span>
                <span v-if="name === 'mana'" style="font-size: 1.0em;">
                    {{value["current"] + " / " + value["max"]}}
                </span>
            </li>
            <!-- SCRAP -->
            <li v-for="(value, name) in arrangePlayerData(info.properties)" :key="name">
                <span v-if="name === 'scrap'" style="font-weight: bold; font-size: 1.0em;">
                    {{name | formatResourceName}}:
                </span>
                <span v-if="name === 'scrap'" style="font-size: 1.0em;">
                    {{value["current"]}}
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
export default {
  name: "PlayerInfo",
  props: ["info", "actions", "targets", "showActions", "currentAction", "selectEntity", "startAction", "cancelAction", "performAction"],
  filters: {
    formatResourceName: function(input) {
        input = input.replace(/_/g, ' ');
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
  },
  methods: {
      arrangePlayerData(playerData) {
          const rawData = playerData;
          const arrangedData = {
              health: {},
              mana: {},
              scrap: {}
          };
          for (let key in rawData) {
              console.log(key + "=" + rawData[key]);
              if (key === "HEALTH") {
                  arrangedData.health["current"] = rawData[key];
              }
              if (key === "MAX_HEALTH") {
                  arrangedData.health["max"] = rawData[key];
              }
              if (key === "MANA") {
                  arrangedData.mana["current"] = rawData[key];
              }
              if (key === "MAX_MANA") {
                  arrangedData.mana["max"] = rawData[key];
              }
              if (key === "SCRAP") {
                  arrangedData.scrap["current"] = rawData[key];
              }
          }
          console.log(arrangedData);
          return arrangedData;
      }
  }
}
</script>
