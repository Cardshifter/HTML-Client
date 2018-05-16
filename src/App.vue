<template>
  <!-- <v-app>
    <v-toolbar app>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-content> -->
      <router-view/>
    <!-- </v-content>
    <v-footer fixed app>
      <span>&copy; 2018 Cardshifter Team - <a href="https://github.com/Cardshifter">Github</a></span>
    </v-footer>
  </v-app> -->
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      title: "Cardshifter"
    };
  }
};
</script>

<style>
@import "./assets/style.css";

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
