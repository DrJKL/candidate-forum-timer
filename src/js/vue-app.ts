import { allCandidates } from "./candidates";

import Vue from "vue";
import App from "./app.vue";
import Buefy from 'buefy';

import 'buefy/dist/buefy.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Buefy);

Vue.config.productionTip = false;

const vue1 = new Vue({
  render: h => h(App),
}).$mount('#app');
