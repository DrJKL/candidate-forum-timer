import { allCandidates } from "./candidates";

import Vue from "vue/dist/vue.js";
import Buefy from 'buefy';
import App from "./app.vue";

import 'buefy/dist/buefy.css';

new Vue({
  el: "#app",
  render: (h: (arg0: any) => any) => h(App),
});
Vue.use(Buefy);