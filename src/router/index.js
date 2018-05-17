import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login";
import Lobby from "@/components/Lobby";
import DeckBuilder from "@/components/DeckBuilder";
import GameBoard from "@/components/GameBoard";

import VueAxios from "vue-axios";
import VueAuthenticate from "vue-authenticate";
import axios from "axios";

// Vue.use(VueAxios, axios);
// Vue.use(VueAuthenticate, {
//   baseUrl: "http://cardshifter.zomis.net:22738", // Your API domain
//   providers: {
//     github: {
//       clientId: "",
//       redirectUri: "http://cardshifter.zomis.net/"
//     }
//   }
// });

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/game_board",
      name: "GameBoard",
      component: GameBoard,
      props: true
    },
    {
      path: "/deck_builder/",
      name: "DeckBuilder",
      component: DeckBuilder,
      props: true
    },
    {
      path: "/lobby",
      name: "Lobby",
      component: Lobby,
      props: true
    },
    {
      path: "/",
      name: "Login",
      component: Login
    }
  ]
});
