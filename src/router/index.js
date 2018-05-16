import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login";
import Lobby from "@/components/Lobby";

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
    // {
    //   path: "/connected",
    //   name: "StartScreen",
    //   component: StartScreen
    // },
    // {
    //   path: "/games/UR/:gameId/",
    //   name: "RoyalGameOfUR",
    //   component: RoyalGameOfUR,
    //   props: route => ({
    //     game: "UR",
    //     gameId: route.params.gameId,
    //     players: route.params.players,
    //     yourIndex: route.params.playerIndex
    //   })
    // },
    {
      path: "/lobby",
      name: "Lobby",
      component: Lobby
    },
    {
      path: "/",
      name: "Login",
      component: Login
    }
  ]
});
