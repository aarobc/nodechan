

var url = 'a.4cdn.org';
var path = '/b/catalog.json'
var board = 'b';

var request = require('request');
var fs = require('fs');
var async = require('async');
// var path = require('path');

function getImg(post, cb){
    // console.log(img);
    var addr = "http://i.4cdn.org/" + board + "/" + post.tim + post.ext; 
    console.log(addr);
    // request(addr).pipe(fs.createWriteStream('/data/images/' + post.filename + post.ext));

    var picStream = fs.createWriteStream('/data/images/' + post.filename + post.ext);
    picStream.on('close', function() {
        console.log('file done');
        cb(null, post);
    });
    request(addr).pipe(picStream); 

}

function allThreads(board, callback){
    request('http://a.4cdn.org/' + board + '/threads.json', function(error, response, body){
        var parsed = JSON.parse(body);
        var threads = Array();
        // for(a in parsed){
        //     threads = threads.concat(parsed[a].threads);
        // }
        threads = threads.concat(parsed[0].threads);
        callback(threads);
    });

}

function posts(board, thread, callback){
    request('http://a.4cdn.org/' + board + '/thread/' + thread.no +'.json', function(error, response, body){
        var parsed = JSON.parse(body);
        var posts = parsed.posts;
        iposts = Array();
        for(a in posts){
            // console.log(posts[a]);
            // should do some analasys here

            // if the post has an image
            if(posts[a].tim){
                // getImg(posts[a]);
                iposts = iposts.concat(posts[a]);
                // var uurl = posts[a].tim + posts[a].ext;
                // console.log(iposts.length);
            }
        }
        // workaround to get it to run after the for loop is completed
        setTimeout(function(){
            callback(iposts);
        },0);
    });

}

allThreads('b', function(tlist){

    // go thourgh all the threads in post and download the image
    for(i in tlist){
    // var i = 0;
        posts('b', tlist[i], function(posts){
            // for(j in posts){
                // var post = posts[j];
                // console.log("num posts:");
                console.log(posts.length);
                // console.log(post.no);
                // getImg(post);
                async.eachSeries(posts, function iterator(post, callback) {
                    console.log(post.no);
                    getImg(post, callback);
                });

            // }

        });
    }

});

