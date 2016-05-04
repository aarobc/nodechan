<template>
<div>
    <div v-for="post in posts" class='row'>
        <div class="col-md-3">
            <img v-if="post.ext" :src="'images/' + post.tim + post.ext">
        </div>
        <div class="col-md-5">
            {{{ post.com }}}
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
    img{
        width: 100%;
    }
/* @import '../node_modules/bootstrap/dist/css/bootstrap.css'; */
/* body { */
/*   font-family: Helvetica, sans-serif; */
/* } */
</style>
