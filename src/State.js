import Vue from "vue";

const State = new Vue({
  data() {
    return {
      availableGameMods: []
    };
  },
  methods: {
    setMods(mods) {
      this.availableGameMods = mods;
    },
    getMods(mods) {
      return this.availableGameMods;
    }
  }
});

export default State;
