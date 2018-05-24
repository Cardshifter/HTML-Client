<template>
  <div>
    <h1>{{ mod }} on server {{ server }}</h1>
    <div>
      <div v-for="(value, key) in cards">
        {{ key }}
      </div>
    </div>
    <div>
      <div v-for="(value, key) in cards">
        <CardModel :card="value"></CardModel>
      </div>
    </div>
    <div v-if="error">{{error}}</div>
  </div>
</template>
<script>
import CardshifterServerAPI from "../server_interface";
import CardModel from "./CardModel";

export default {
  name: "CardList",
  props: ["server", "mod"],
  data() {
    return {
      data: {},
      cards: {},
      error: null
    }
  },
  components: {
    CardModel
  },
  created() {
    var now = Date.now();
    let ws = new WebSocket(this.server);
    ws.onopen = () => {
      var getCards = new CardshifterServerAPI.messageTypes.ServerQueryMessage("DECK_BUILDER", this.mod);
      getCards.command = "query";
      ws.onmessage = (message) => {
        console.log("response retrieved:");
        console.log(message.data);
        this.$set(this, 'data', JSON.parse(message.data));
        this.$set(this, 'cards', this.data.configs.Deck.cardData);
        ws.close();
      };
      ws.send(JSON.stringify(getCards));
    };
    ws.onerror = () => {
      this.error = "Unable to connect to server";
    }
  },
  beforeDestroy() {

  }
}


</script>
<style scoped>
.card-outer {
  margin: 40px;
}
</style>
