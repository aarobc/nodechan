

var url = 'a.4cdn.org';
var path = '/b/catalog.json'
var board = 'b';

var request = require('request');
var fs = require('fs');
// var path = require('path');

function getImg(post){
    // console.log(img);
    var addr = "http://i.4cdn.org/" + board + "/" + post.tim + post.ext; 
    console.log(addr);
    request(addr).pipe(fs.createWriteStream('/data/images/' + post.filename + post.ext));
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
        posts = parsed.posts;
        iposts = Array();
        for(a in posts){
            // console.log(posts[a]);
            // should do some analasys here

            if(posts[a].tim){
                // getImg(posts[a]);
                iposts = iposts.concat(posts[a]);
                // var uurl = posts[a].tim + posts[a].ext;
            }
            callback(iposts);
        }
    });

}

allThreads('b', function(tlist){

    // for(i in tlist){
    var i = 0;
        posts('b', tlist[i], function(r){
            for(i in r){
                post = r[i];
                console.log(post);
                getImg(post);
            }

        });
    // }

    // get all thread contents yes
});
        // for(a in first.threads){
        //     var url = "http://i.4cdn.org/b/" + first.threads[a].tim + first.threads[a].ext;
        //     var filename = first.threads[a].filename + first.threads[a].ext;
        //     var img = {
        //         url: url,
        //         filename: filename
        //     }
        //
        //     callback(parsed);
        //     // getImg(img);
        //
        // }
