<template>
  <div class="card card-outer"
    :class="{'selected': card.selected, 'targetable': doingAction && targets.indexOf(card.id) !== -1}">
<!--
    TODO Add ng-FitText.js fields to elements in this model of which length may vary widely, for example card descriptions and flavor text.
        The primary fields for FitText are:
        - data-fittext : Enable FitText for the content inside the tag
        - data-fittext-min="8pt" : Minimum font size allowed
        - data-fittext-max="12pt" : Maximum font size allowed
  -->

    <div class="test" v-if="debugMode">doingAction: {{doingAction}} targets: {{targets}} actions: {{actions}} card: {{card}}</div>
    <!-- card name -->
    <div>
        <div class="card-name">
            <a @click="selectEntity(card)" :class="{'selected': card.selected, 'targetable': doingAction && targets.indexOf(card.id) !== -1}">{{card.properties.name}}</a>
        </div>

    </div>
    <!-- card image -->
    <div style="clear:both;">
        <div style="text-align: center;">
            <img style="width: 160px; height: 120px;" class="card-image"
                 :src="resolveImage(card.properties.imagePath)" />
        </div>
    </div>
    <!-- card type -->
    <div class="card-type">
        {{card.properties.creatureType}}
    </div>
    <!-- card statistics -->
    <div>
        <!-- mana cost -->
        <div style="float: left; padding: 5px">
            <button class="btn btn-sm btn-info active fa fa-tint" style="cursor:default">{{card.properties.MANA_COST}}</button>
        </div>
        <div style="float: right; padding: 5px;" class="btn-group">
            <!-- attack -->
            <button class="btn btn-sm btn-danger active fa fa-crosshairs" style="cursor:default">{{card.properties.ATTACK || "-"}}</button>
            <!-- health -->
            <div class="card-property">
                <button class="btn btn-sm btn-success active fa fa-heart" style="cursor:default">{{card.properties.HEALTH || "-"}}</button>
                <!-- <dynamic-animation items="card.animations.HEALTH" /> -->
            </div>
        </div>
    </div>
    <div style="clear: both;">
        <div style="float: left; padding: 5px; text-align: center;">
            <!-- scrap cost -->
            <button v-if="card.properties.SCRAP_COST" class="btn btn-xs btn-primary active fa fa-wrench" style="cursor:default">{{card.properties.SCRAP_COST}}</button>
        </div>
        <div v-if="card.properties.SCRAP" style="float: left; padding: 5px; text-align: center;">
            <!-- scrap value -->
            <button class="btn btn-xs btn-primary active fa fa-cog" style="cursor:default">{{card.properties.SCRAP}}</button>
        </div>
        <!-- flavor text -->
        <div v-show="card.properties.flavor" style="float: right; padding: 5px; text-align: center;">
            <b-btn type="button" class="btn btn-xs btn-primary fa fa-book"
                    popover-placement="top"
                    v-b-popover.hover="card.properties.flavor"></b-btn>
        </div>
        <!-- effect text -->
        <div v-show="card.properties.effect" style="float: right; padding: 5px; text-align: center;">
            <b-btn type="button" class="btn btn-xs btn-warning fa fa-flash"
                    popover-placement="top"
                    v-b-popover.hover="card.properties.effect">FX</b-btn>
        </div>
    </div>
    <div class="card-actions">
        <button class="btn btn-xs btn-navbar csh-button btn-default" v-for="action in actions"
                :key="action.action"
                v-if="!doingAction && action.id === card.id"
                @click="startAction(action)">
            {{action.action}}
        </button>
    </div>
  </div>
</template>
<script>
import CardshifterServerAPI from "../server_interface";
import State from "../State";

export default {
  name: "CardModel",
  props: ["card", "targets", "doingAction", "selectEntity", "actions", "startAction"],
  data() {
    return {
      debugMode: false
    }
  },
  methods: {
    resolveImage(path) {
      return require('../assets/images/cards/' + path);
    }
  },
  created() {

  },
  computed: {

  },
  beforeDestroy() {

  }
}
</script>
<style>
.btn {
    min-width: 0;
    margin: 0;
}

.card-outer {
    width: 180px;
    height: 275px;
    border-style: groove;
    border-width: 5px;
    border-color: silver;
    border-radius: 10px;
    background: gainsboro;
    float: left;
    padding: 2px;
    margin-bottom: 10px;
}

.card-image {
    border-style: solid;
    border-width: 2px;
    border-color: black;
    border-radius: 10px;
}

.card-name {
    float: left;
    padding: 5px;
    font-family: Georgia, Times, "Times New Roman", serif;
    font-size: 1.2em;
    font-weight: bold;
}

.card-type {
    clear:both;
    padding: 5px;
    padding-top: 8px;
    font-family: Georgia, Times, "Times New Roman", serif;
    font-size: 1.1em;
}

.card-actions {
    width: 180px;
    clear: both;
    /*border-style: solid;
    border-width: 3px;
    border-color: black;
    border-radius: 10px;*/
    text-align: center;
}

.card.ng-enter, .card.ng-leave, .card.ng-move {
    -webkit-transition: 0.5s linear all;
    -moz-transition: 0.5s linear all;
    -o-transition: 0.5s linear all;
    transition: 0.5s linear all;
}

.card.ng-enter, .card.ng-move {
    opacity: 0;
    height: 0;
    overflow: hidden;
}

.card.ng-move.ng-move-active,
.card.ng-enter.ng-enter-active {
    opacity: 1;
    height: 275px;
}

.card.ng-leave {
    opacity: 1;
    overflow: hidden;
}

.card.ng-leave.ng-leave-active {
    opacity: 0;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

/* CARD PROPERTY ANIMATION */

.card-property {
    position: relative;
    display: inline-block;
}

button.diff-animation {
    z-index: 4;
    position: absolute;
    opacity: 0;
}

.diff-animation.ng-leave {
    -webkit-transition: 1.5s linear all;
    -moz-transition: 1.5s linear all;
    -o-transition: 1.5s linear all;
    transition: 1.5s linear all;
}

.diff-animation.ng-leave {
    opacity: 1;
}

.diff-animation.ng-leave.ng-leave-active {
    opacity: 0;
    top: -32px;
}
</style>
