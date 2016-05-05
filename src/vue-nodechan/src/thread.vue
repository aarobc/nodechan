<template>
<div class="list-group scrollbox">
    <div v-for="post in posts" class='list-group-item'>
        <div class="row">
            <div class="col-md-3">
                <a target="_blank" :href="'images/' + post.tim + post.ext">
                <img class="thumb" v-if="post.ext && post.ext != '.webm'"
                :src="'images/' + post.tim + post.ext">
                <video preload="metadata" class="thumb" controls v-if="post.ext == '.webm'">
                    <source :src="'images/' + post.tim + post.ext">
                </video>
                </a>
            </div>
            <div class="col-md-9">
                {{{ post.com }}}
            </div>
        </div>
    </div>
</div>
</template>

<script>
// require ('bootstrap')
export default {
    data () {
        return {
            url: `api/threads/${this.thread}/posts`,
            posts: []
        }
    },

    props: {
        thread: {
            type: Number,
            required: true
        }
    },

    created() {
       console.log(this.thread);
       this.$http.get(this.url)
       .then((resp) => {
            this.posts = resp.data;
       });
    },

    methods: {

    }
}
</script>

<style>
    .thumb{
        max-width: 100%;
        max-height: 215px;
    }

    .scrollbox{
        height: calc(100vh - 112px);
        overflow: auto;
        margin-bottom: 0px;
    }
    /* img:hover{ */
    /*     position:fixed; */
    /*     top:0px; */
    /*     right: 0px; */
    /* } */

/* @import '../node_modules/bootstrap/dist/css/bootstrap.css'; */
/* body { */
/*   font-family: Helvetica, sans-serif; */
/* } */
</style>
