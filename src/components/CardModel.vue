<template>
    <div class="card card-outer"
        :class="{'selected': card.selected, 'targetable': doingAction && targets.indexOf(card.id) !== -1}">
        <div class="test"
            v-if="debugMode">doingAction: {{doingAction}} targets: {{targets}} actions: {{actions}} card: {{card}}
        </div>
        <!-- card name -->
        <div>
            <div class="card-name">
                <a @click="selectEntity(card)"
                    :class="{'selected': card.selected, 'targetable': doingAction && targets.indexOf(card.id) !== -1}"
                    :style="`font-size: ${adjustFontSize(card.properties.name)}em`">
                    {{card.properties.name}}
                </a>
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
        <div class="card-type"
            :style="`font-size: ${adjustFontSize(card.properties.creatureType)}em`">
            {{card.properties.creatureType}}
        </div>
        <!-- card statistics -->
        <div>
            <!-- mana cost -->
            <div style="float: left; padding-left: 5px;">
                <Value :value="card.properties.MANA_COST" type="mana-cost" orElse="0" alwaysShow></Value>
            </div>
            <div style="float: right; padding-right: 5px;" class="btn-group">
                <Value :value="card.properties.ATTACK" type="attack" alwaysShow></Value>
                <Value :value="card.properties.HEALTH" type="health" alwaysShow></Value>
            </div>
        </div>
        <div style="clear: both;">
            <Value style="float: left; padding: 5px;" :value="card.properties.SCRAP_COST" type="scrap_cost"></Value>
            <Value style="float: left; padding: 5px;" :value="card.properties.SCRAP" type="scrap"></Value>

            <!-- flavor text -->
            <div v-show="card.properties.flavor" style="float: right; padding: 5px; text-align: center;">
                <b-btn class="btn btn-sm btn-dark fa fa-book" :id="`${card.id}-flavor`"></b-btn>
                <b-popover :target="`${card.id}-flavor`"
                    :title="card.properties.name"
                    triggers="hover focus"
                    :content="card.properties.flavor"
                    placement="bottomleft">
                </b-popover>
            </div>
            <!-- effect text -->
            <div v-show="card.properties.effect" style="float: right; padding: 5px; text-align: center;">
                <b-btn class="btn btn-sm btn-secondary fa fa-flash" :id="`${card.id}-effect`">FX</b-btn>
                <b-popover :target="`${card.id}-effect`"
                    :title="card.properties.name"
                    triggers="hover focus"
                    :content="card.properties.effect"
                    placement="bottomleft">
                </b-popover>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-sm btn-navbar" v-for="action in actions"
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
import Value from "./Value";

export default {
    name: "CardModel",
    props: ["card", "targets", "doingAction", "selectEntity", "actions", "startAction"],
    data() {
        return {
            debugMode: false
        }
    },
    components: {
      Value
    },
    methods: {
        /**
         * Resolves fetching an image file from the file system.
         *
         * @param  {String} path - the path to the image
         * @return {Object} - the image object from the require call
         */
        resolveImage(path) {
            try{
                return require(`../assets/images/cards/${path}`);
            } catch(err) {
                console.log(err);
                return require(`../assets/images/cards/default.png`);
            }
        },
        /**
         * Adjusts the size of the font to be displayed on a CardModel
         * based on the length of the text and whether it is all caps.
         *
         * @param  {String} text - the text to decide the font size for
         * @return {Number} - the font size in em units
         */
        adjustFontSize(text) {
            let baselineEm = 1.1;
            if (!text) {
                return baselineEm;
            }
            const isAllCaps = text === text.toUpperCase();
            const length = text.length;
            if (length >= 20) {
                baselineEm = isAllCaps ? 0.7 : 0.8;
            } else if (length >= 18) {
                baselineEm = isAllCaps ? 0.9 : 1.0;
            } else if (length >= 15 && isAllCaps) {
                baselineEm = 0.9;
            }
            return baselineEm;
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
    padding-left: 5px;
    font-family: Georgia, Times, "Times New Roman", serif;
    font-size: 0.9em;
}

.card-type {
    clear:both;
    padding: 5px;
    padding-top: 8px;
    font-family: Georgia, Times, "Times New Roman", serif;
    font-size: 0.9em;
}

.card-actions {
    width: 180px;
    clear: both;
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
