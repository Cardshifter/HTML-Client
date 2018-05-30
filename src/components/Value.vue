<template>
  <div v-if="value || alwaysShow" class="card-property">
    <button class="btn btn-sm active fa" :class="`btn-${buttonStyle} fa-${faValue}`" style="cursor:default" :title="title">
      {{value || orElse}}
    </button>
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
      buttonStyle: style.buttonStyle,
      faValue: style.fa,
      title: style.title
    };
  }
}

</script>
