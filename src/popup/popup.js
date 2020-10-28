import Vue from 'vue/dist/vue.runtime.esm';
import vuetify from '../plugins/vuetify';
import App from './App';

import 'vuetify/dist/vuetify.css';

Vue.config.devtools = true;
new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
