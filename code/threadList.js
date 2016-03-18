var async = require('async');
var request = require('request');
var each = require('mongo-each');
var _ = require('lodash');
var fs = require('fs-promise');

var rp = require('request-promise');

_.enhance = function(list, source) {
    return _.map(list, function(element) { return _.extend({}, element, source); });
}

module.exports = function(db, board){

    var module = {};
    var interval = {};
    module.board = board;

    function insertThreads(threads){
        return new Promise((resolve, reject) => {

            // workaround because can't figure out a way to add it on the insert
            for(t of threads){
                t.deleted = false;
            }

            var dbThreads = db.collection('threads');
            // getting all the stored threads
            // var cursor = dbThreads.find({});
            var cursor = dbThreads.find({deleted: false});

            each(cursor,{
                concurrency: 1000,
            }, function(dbThread, callb){
                var there = _.find(threads, {no: dbThread.no});
                if(!there){
                    console.log('not there');
                    dbThreads.updateOne(dbThread, {$set: {deleted: true}}, function(err, result){
                        callb();
                    });
                }
                else{
                    callb();
                }

            }, function(err){
                // have to manually do the inserts because dumb
                async.eachSeries(threads, function(item, cb2){
                    dbThreads.updateOne({no: item.no}, item, {upsert: true}, function(e, res){
                        // console.log(e);
                        cb2();
                    });
                }, function(){
                    // cb();
                    resolve('inserted the thing');
                });
            });
        })
    };
    // requests and returns array object of all
    module.processThreads = function(){

        return new Promise ((resolve, reject) => {

            var options = {
                uri:'http://a.4cdn.org/' + module.board + '/threads.json',
                json: true
            };
            rp(options)
            .then((pages) => {
                var threads = [];

                for(i in pages){
                    threads = threads.concat(pages[i].threads);
                }
                console.log(threads.length);
                // insert(threads, callback);
                return insertThreads(threads);
            }).then((resp) =>{
                console.log(resp);
                resolve('all saved');
            });
        });

    }


    module.processPosts = function(){
        // return new Promise((resolve, reject) => {
            var cursor = db.collection('threads')
            .find({deleted: false}, {no: 1, _id: 0});

            cursor.toArrayAsync().then((threads) => {
                console.log('thread: ' + threads[0].no);
                return loadThread(threads[0].no);
            }).then((stuff) => {
                console.log('done');
                return 'oe';
            });
        // });
    }

    function loadThread(thread){
        return new Promise( (resolve) => {
            var options = {
                uri:`http://a.4cdn.org/${module.board}/thread/${thread}.json`,
                json: true
            };
            rp(options).then(posts => {
                // console.log(posts.posts);
                posts = _.enhance(posts.posts, {thread: thread});

                return posts.map(insertPosts);
            }).catch(err => {
                console.log('err, probably not therr');
            }).then(res => {
                // console.log(res);
                console.log('almost');
            });

        });
    }

    function insertPosts(post){
        console.log(post.no);
        return new Promise(resolve => {

            db.collection('posts').insertAsync(post)
            .then(res => {
                resolve('inswerded');
            }).catch(err => {
                console.log(err);
                resolve('err');
            });
        });


    }

    function download(post, board, cb){
        // console.log(img);
        var addr = `http://i.4cdn.org/${board}/${post.tim}${post.ext}`;
        var dest = `/data/${board}/${post.filename}${post.ext}`;
        var picStream = fs.createWriteStream(dest);

        // setting up the pic stream with callbacks
        picStream.on('close', function() {
            console.log('file done');
            cb(null, post);
        });
        // run it
        request(addr).pipe(picStream);

    }

    return module;
};
