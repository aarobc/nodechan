<template>
  <div id="app" class="container">
    <h1>Threads</h1>
    <ul class="nav nav-tabs">
        <li v-for="tab in tabs"
            @click="activeTab = tab"
            :class="active(tab)"><a href="#">{{ tab }}</a>
            <span class="pull-right">X</span>
            <!-- <span class="glyphicon glyphicon&#45;remove" aria&#45;hidden="true"></span> -->
        </li>
    </ul>


      <div v-if="activeTab == 'Threads'" v-for="thread in threads" class='row'>
          <div class="col-md-5" @click="addTab(thread)">
              {{ thread.no }}
          </div>
      </div>
      <div v-show="activeTab == tab" v-if="tab != 'Threads'" v-for="tab in tabs">
          <thread :thread="tab"></thread>
      </div>
  </div>
</template>

<script>
// require ('bootstrap')
import Thread from './thread.vue'

export default {
    data () {
        return {
            url: 'api/threads',
            threads:[],
            tabs: ['Threads'],
            activeTab: 'Threads'
        }
    },

    created() {
       this.$http.get(this.url)
       .then((resp) => {
            this.threads = resp.data;
       });
    },

    computed: {
    },

    components: {
        Thread
    },

    methods: {
        addTab(thread){
            this.tabs.push(thread.no);
        },

        active(tab){
            return (tab == this.activeTab) ? 'active': '';
        }

    }
}
</script>

<style>
@import '../node_modules/bootstrap/dist/css/bootstrap.css';
body {
  font-family: Helvetica, sans-serif;
}
</style>
