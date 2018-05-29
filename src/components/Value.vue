<template>
  <div v-if="value || alwaysShow" class="card-property">
    <button class="btn btn-sm active fa" :class="`btn-${buttonStyle} fa-${faValue}`" style="cursor:default" :title="title">
      {{value || orElse}}
    </button>
    <transition-group name="diff-once" class="pos-absolute" tag="div" @after-enter="removeDiff()">
      <button v-for="(diff, index) in diffs" :key="index"
        class="btn btn-sm active fa diff-once" :class="`btn-${buttonStyle} fa-${faValue}`" style="cursor:default">
        {{diff}}
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
      buttonStyle: style.buttonStyle,
      faValue: style.fa,
      title: style.title
    };
  },
  methods: {
    removeDiff() {
      console.log("remove first diff");
      this.diffs.splice(0, 1);
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      console.log("change value from " + oldValue + " to " + newValue);
      let diff = newValue - oldValue;
      this.diffs.push(diff);
//      TweenLite.to(this.$data, 0.5, { tweenedNumber: newValue });
    }
  }
}

</script>
