<template>
  <div>
    <h1>{{ mod }} on server {{ server }}</h1>
    <div>
      <div v-for="(value, key) in cards" :key="key">
        <CardModel :card="value"></CardModel>
      </div>
    </div>
    <div>
      <table>
          <tr>
            <th v-for="propertyName in tableKeys" :key="propertyName">
              {{ propertyName }}
            </th>
          </tr>
          <tr v-for="(card, cardKey) in cards" :key="cardKey">
            <td v-for="propertyName in tableKeys" :key="propertyName">
              {{card.properties[propertyName] || '-'}}
            </td>
          </tr>
      </table>
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

  },
  computed: {
    tableKeys: function() {
      let result = {};
      for (var card in this.cards) {
        for (var property in this.cards[card].properties) {
          result[property] = true;
        }
      }
      delete result["id"];
      delete result["imagePath"];
      delete result["name"];
      return ["name"].concat(Object.keys(result));
    }
  }
}


</script>
<style scoped>
.card-outer {
  margin: 40px;
}
</style>
