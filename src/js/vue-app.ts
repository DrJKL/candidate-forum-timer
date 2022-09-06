import Vue from 'vue';
import App from './app.vue';

import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false;

const vue1 = new Vue({
  render: (h) => h(App),
}).$mount('#app');
