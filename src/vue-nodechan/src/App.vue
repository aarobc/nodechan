<template>
  <div id="app" class="container">
    <div class='row'>
        <div class='col-md-2'>
        <h1>Threads</h1>
        </div>
        <div class='col-md-1 col-md-offset-9'>
            <select v-model='currentBoard'>
                <option v-for="board in boards" v-bind:value="board.board">
                    {{ board.board }}
                </option>
            </select>
        </div>
    </div>
    <ul class="nav nav-tabs">
        <li v-for="tab in tabs"
            @click="activeTab = tab"
            :class="active(tab)"><a href="#">{{ tab }}</a>
            <span @click='rmTab(tab)' :class='xbox(tab)'>X</span>
            <!-- <span class="glyphicon glyphicon&#45;remove" aria&#45;hidden="true"></span> -->
        </li>
    </ul>


      <div class="row space" v-if="activeTab == 'Threads'">
          <div class="col-md-9">
              <div v-for="thread in threads" class='row'>
                  <div class="col-md-5" @click="addTab(thread)">
                      {{ thread.no }} ({{ thread.replies }})
                  </div>
              </div>
          </div>
          <div class="col-md-3">
              <div class="input-group">
                  <input type="text" class="form-control"
                  debounce="500"
                  v-model="request.query" placeholder="Search">
                  <span class="input-group-btn">
                      <button class="btn btn-default" @click="request.query = ''" type="button">
                          Clear
                      </button>
                  </span>
              </div>
              <div class="input-group space">
                  <div class="input-group-btn">
                      <button type="button" class="btn btn-default">Rebuild cache</button>
                  </div>
              </div>
          </div>
          <div class="row">
              <div class="col-md-12">
                  <nav>
                      <ul class="pagination">
                          <li>
                              <a href='#' aria-label="previous">
                                  <span aria-hidden="true">&laquo;</span>
                              </a>
                          </li>
                          <li><a href="#">1</a></li>
                          <li><a href="#">2</a></li>
                          <li>
                              <a href="#" aria-label="Next">
                                  <span aria-hidden="true">&raquo;</span>
                              </a>
                          </li>
                      </ul>
                  </nav>
              </div>
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
            listUrl: '/api/boards',
            url: 'api/posts',
            threads:[],
            tabs: ['Threads'],
            activeTab: 'Threads',
            boards: [],
            currentBoard: 'wsg',

            request: {
                query: '',
                limit: '',
                no: ''
            }
        }
    },

    watch: {
        'request': {
            handler: function(val, old){
                this.load();
            },
            deep: true
        }
    },
    created() {
        this.load();
    },

    computed: {
    },

    components: {
        Thread
    },

    methods: {
        load(){
           this.$http.get(this.url, this.request)
           .then((resp) => {
                this.threads = resp.data;
           });

           this.$http.get(this.listUrl)
           .then((resp) => {
                this.boards = resp.data.boards
                this.currentBoard = resp.data.default
           });
        },
        addTab(thread){
            this.tabs.push(thread.no);
        },

        rmTab(tab){
            this.tabs.$remove(tab);
            this.activeTab = this.tabs[ this.tabs.length -1 ];
        },

        active(tab){
            return (tab == this.activeTab) ? 'active': '';
        },

        xbox(tab){
            return (tab == 'Threads') ? 'none' : 'xbox';
        }



    }
}
</script>

<style>
    @import '../node_modules/bootstrap/dist/css/bootstrap.css';
    body {
      font-family: Helvetica, sans-serif;
    }
    .xbox{
        top: 0px;
        right: 7px;
        position:absolute;
    }
    .none{
        display:none;
    }

    .space{
        padding-top:30px;
    }
</style>
