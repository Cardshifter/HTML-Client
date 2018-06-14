// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import { CssGrid, CssGridItem, ViewportListener } from 'vue-css-grid';

Vue.use(BootstrapVue);

Vue.component('css-grid', CssGrid)
Vue.component('css-grid-item', CssGridItem)
Vue.component('viewport-listener', ViewportListener)

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>"
});
