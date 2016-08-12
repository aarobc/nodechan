import Vue from 'vue'
import App from './App.vue'
import VR from 'vue-resource'

global.jQuery = require('jquery');
require('bootstrap');

Vue.use(VR)

// Vue.config.devtools = true

new Vue({
  el: 'body',
  components: { App }
})
