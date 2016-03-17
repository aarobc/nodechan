
var async = require('async');
var request = require('request');
var each = require('mongo-each');
var _ = require('underscore');

module.exports = function(db){

    console.log("what");
    var module = {};
    var interval = {};
    module.board = board;

    // function iterate(cb){
    module.iterate = function(){


        var dbThreads = db.collection('threads');
        var cursor = dbThreads.find({deleted: false});

        each(cursor,{
            concurrency: 1000,
        }, function(dbThread, callb){
            console.log(dbThread);

        }, function(err){
            console.log('done one');
        });

    };


    function savePosts(id, cb){

        var addr = 'http://a.4cdn.org/' + module.board + '/thread/' + id + '.json';
        console.log(addr);
        request(addr, function(error, response, body){
            var jason = JSON.parse(body);
            var posts = jason.posts;
            console.log(posts);
            // var dbPosts = db.collection('posts');

            // insert(threads, callback);
        });

    }
    return module;
};
