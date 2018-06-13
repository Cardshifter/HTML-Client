<template>
  <div class="setcard">
    <SetSymbol v-for="index in count" :key="index" :symbol="symbol" :color="color" :filling="filling">
    </SetSymbol>
  </div>
</template>
<script>
import SetSymbol from "./SetSymbol";

export default {
  name: "SetCard",
  props: ["count", "symbol", "color", "filling"],
  components: {
    SetSymbol
  }
}
</script>
<style scoped>
.setcard {
  border: 3px solid black;
  width: 200px;
  height: 300px;
  margin: 20px;
  flex-direction: column;
  display: flex;
  justify-content: center;
}
</style>
