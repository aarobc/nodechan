var async = require('async');
var request = require('request');
var each = require('mongo-each');
var _ = require('lodash');
var fs = require('fs');
var http = require('http');
var url = require('url');
var Promise = require('bluebird');

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
                    // console.log('not there');
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
                    resolve({msg: 'inserted the thread list'});
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
        return new Promise((resolve, reject) => {
            var cursor = db.collection('threads')
            .find({deleted: false}, {no: 1, _id: 0});

            cursor.toArrayAsync().then((threads) => {
                // return loadThread(threads[0]);
                return mapSerial(threads, loadThread);
                // return Promise.all(actions);
                // var actions = threads.map(loadThread);
                // return pseries(actions);
            }).then((val) => {
                console.log('processPosts done');
                var f = _.filter(val, 'downloaded');
                // console.log(f);
                // console.log(val);
                console.log(f.length);
                // return stuff;
                resolve(val);
            });
        });
    }

    function loadThread(thread){
        thread = thread.no;
        return new Promise( (resolve) => {
            var options = {
                uri:`http://a.4cdn.org/${module.board}/thread/${thread}.json`,
                json: true
            };
            rp(options).then(posts => {
                // console.log(posts.posts);
                posts = _.enhance(posts.posts, {thread: thread});
                console.log('posts length');
                console.log(posts.length);

                return mapSerial(posts, insertPost);
            }).catch(err => {
                console.log(err);
                console.log('err, probably not therr');
                resolve({msg: "thread probably does not exist exist"});
            }).then(res => {
                console.log('results length');
                console.log(res.length);
                var f = _.filter(res, 'downloaded');
                console.log('downloaded:' + f.length);
                // console.log(f);
                // console.log(res);
                resolve(res);
            });

        });
    }

    function mapSerial(posts, method){

        return new Promise(resolv => {

            var retd = Array();
            Promise.reduce(posts, (pac, post) =>{
                retd.push(pac);
                return method(post);
            }, 0).then(val =>{
                retd.push(val);
                retd.shift();
                resolv(retd);
            });

        });
    }

    function insertPost(post){
        // console.log(post.no);
        return new Promise(resolve => {

            db.collection('posts').insertAsync(post)
            .then(res => {
                // resolve('inswerded');
                if(post.ext){
                    return download(post);
                }
                else{
                    return {msg: 'no image'};
                }
            }).catch(err => {
                // console.log(err);
                resolve({msg: 'already in db'});
            }).then(p => {
                // console.log('endl');
               // console.log(p);
               // debugger;
               resolve(p);
            });
        });


    }

    function download(post){
        // console.log(post);
        return new Promise(resolv =>{
            var addr = `http://i.4cdn.org/${board}/${post.tim}${post.ext}`;
            var dest = `/data/${board}/${post.filename}${post.ext}`;

            var options = {
                host: url.parse(addr).host,
                port: 80,
                path: url.parse(addr).pathname
            };

            // var file_name = url.parse(file_url).pathname.split('/').pop();
            var file = fs.createWriteStream(dest);

            http.get(options, function(res) {
                res.on('data', function(data) {
                    file.write(data);
                }).on('end', function() {
                    file.end();
                    console.log('downloaded ' + addr);
                    resolv({downloaded: addr});
                });
            });
        });
    }


    function filter(terms){
        return new Promise(resolv =>{

        });
    }

    return module;
};
