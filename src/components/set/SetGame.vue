<template>
  <div class="setgame">
    <div class="area">
      <SetCard v-for="(card, index) in currentCards" :key="index" :symbol="card.symbol" :count="card.count"
        :filling="card.filling" :color="card.color">
      </SetCard>
    </div>
    <div class="empty"></div>
    <SetCard symbol="wave" count="1" filling="solid" color="red"></SetCard>
  </div>
</template>
<script>
import SetCard from "./SetCard";

export default {
  name: "SetGame",
  data() {
    return {
      currentCards: []
    }
  },
  components: {
    SetCard
  },
  created() {
    [1, 2, 3].forEach(count =>
      ["wave", "rounded", "diamond"].forEach(symbol => this.currentCards.push({
        count: count, symbol: symbol, filling: "empty", color: "red"
      }))
    )
  }
}
</script>
<style scoped>
.area {
//  display: grid;
//  grid-template: 300px 300px 300px / 200px 200px 200px 200px;
}

.empty {
  margin-top: 200px;
}
</style>
