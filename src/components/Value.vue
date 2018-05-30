<template>
  <div v-if="value || alwaysShow" class="card-property">
    <button class="btn btn-sm active fa" :class="`btn-${buttonStyle} fa-${faValue}`" style="cursor:default" :title="title">
      {{ displayText }}
    </button>
    <transition-group name="diff-once" class="pos-absolute" tag="div" @after-enter="removeDiff()">
      <button v-for="diff in diffs" :key="diff.id"
        class="btn btn-sm active fa diff-once" :class="`btn-${buttonStyle} fa-${faValue}`" style="cursor:default">
        {{diff.value}}
      </button>
    </transition-group>
  </div>
</template>
<script>
export default {
  name: "Value",
  props: {
    type: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: undefined
    },
    valueMax: {
      type: Number,
      default: undefined
    },
    orElse: {
      type: String,
      default: "-"
    },
    alwaysShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let type = this.type;
    let style = { buttonStyle: "info", fa: "tint", title: "" };
    if (type === "mana") {
        style = { buttonStyle: "info", fa: "tint", title: "Mana" };
    }
    if (type === "mana_cost") {
        style = { buttonStyle: "info", fa: "tint", title: "Mana Cost" };
    }
    if (type === "mana_cost_upkeep") {
        style = { buttonStyle: "info", fa: "tint", title: "Mana Cost/Upkeep" };
    }
    if (type === "attack") {
      style = { buttonStyle: "danger", fa: "crosshairs", title: "Attack" };
    }
    if (type === "health") {
      style = { buttonStyle: "success", fa: "heart", title: "Health" };
    }
    if (type === "scrap_cost") {
      style = { buttonStyle: "primary", fa: "wrench", title: "Scrap Cost" };
    }
    if (type === "scrap") {
      style = { buttonStyle: "primary", fa: "cog", title: "Scrap Value" };
    }

    return {
      diffs: [],
      diffId: 0,
      buttonStyle: style.buttonStyle,
      faValue: style.fa,
      title: style.title
    };
  },
  computed: {
    displayText() {
      if (this.valueMax) {
        return this.value + " / " + this.valueMax;
      }
      return this.value || this.orElse;
    }
  },
  methods: {
    removeDiff() {
      this.diffs.splice(0, 1);
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      console.log(typeof newValue);
      let diff = newValue - oldValue;
      this.diffs.push({value: diff, id: this.diffId});
      this.diffId++;
    }
  }
}

</script>
