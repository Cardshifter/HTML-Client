<template>
<div class="properties player-info-box">
    <h4 style="text-decoration: underline; font-weight: bold;" @click="selectEntity(info)"
        :class="{'selected': info.selected, 'targetable': currentAction !== null && targets.indexOf(info.id) !== -1}">{{info.name}}</h4>
    <ul style="list-style: none outside none; margin: 0; padding: 0;">
        <li v-for="(value, name) in info.properties" :key="name">
            <b>{{name | formatResourceName}}</b>: {{value}}
        </li>
        <li><b>Cards: </b>{{ info.zones.Hand ? info.zones.Hand.length() : "?" }}</li>
    </ul>
    <!-- Action buttons -->
    <div class="player-actions">
        <div v-for="action in actions" v-if="action.isPlayer && action.id == info.id" :key="action.action">
            <input @click="startAction(action)" v-show="currentAction === null" type="button" :value="action.action"
                   class="btn btn-navbar csh-button"/>
        </div>
        <div v-show="showActions">
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
  props: ["info", "actions", "showActions", "currentAction", "selectEntity", "startAction", "cancelAction", "performAction"],
  filters: {
    formatResourceName: function(input) {
        input = input.replace(/_/g, ' ');
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
  }
}
</script>
