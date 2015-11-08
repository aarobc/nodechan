var url = 'a.4cdn.org';
var path = '/b/catalog.json'
var board = 'b';

var request = require('request');
var fs = require('fs');
var async = require('async');
var co = require('co');
var mongo = require('mongodb').MongoClient;//,
// assert = require('assert');

// Connection URL
var mdbUrl = 'mongodb://mongo:27017/nodechan';

// mongo.connect(url, function(err, db) {
//     assert.equal(null, err);
//     console.log("Connected correctly to server");
//
//     db.close();
// });


co(function*(){

    console.log('hello world?');
    var db = yield mongo.connect(mdbUrl);
    console.log('goodbye world');

    var threads = db.collection('threads');
    yield threads.createIndex({"no": 1}, {unique: true});
    yield db.close();
    console.log('index?');

    // nextTest();
    yield allThreads('b', function(){
        console.log('done?');
    });
    console.log('here?');

    function saveThreads(thrds, cb){

        // db.open(function(err, db){
        //     console.log('potato');
        //     db.close(function(){
        //         cb();
        //     });

            // var threads = db.collection('threads');
            // threads.insertMany(thrds, function(err, result){
            //     // console.log(err);
            //     // console.log(result);
            //     // console.log('insert done maybe');
            //     db.close();
            //     cb();
            // });
        // });
    }

    function nextTest(){

        // yield db.open();
        console.log('nextTest');
        var threads = db.collection('threads');
        var cursor = threads.find({});
        cursor.each(function(err, thread){
            console.log(thread);
            console.log(err);
            console.log("what");
            if(thread == null){
                // callback here if to do something else fun
                console.log('done?');
                db.close();
            }
        });
    }

    var testAll = function(){
        allThreads('b', function(){
            console.log('done?');
        });
    }

    function getImg(post, board, cb){
        // console.log(img);
        var addr = "http://i.4cdn.org/" + board + "/" + post.tim + post.ext;
        console.log(addr);
        // request(addr).pipe(fs.createWriteStream('/data/images/' + post.filename + post.ext));

        var picStream = fs.createWriteStream('/data/' + board + '/' + post.filename + post.ext);

        // setting up the pic stream with callbacks
        picStream.on('close', function() {
            console.log('file done');
            cb(null, post);
        });

        // run it
        request(addr).pipe(picStream);

    }


    function asyncExample(){

        async.map(orders.orders, parseOrder, function(err, results) {
            // console.log(results);
            formatData(results);
        });
    }

    // requests and returns array object of all
    function allThreads(board, callback){

        var addr = 'http://a.4cdn.org/' + board + '/threads.json';
        request(addr, function(error, response, body){
            var pages = JSON.parse(body);
            var threads = Array();
            // for(a in parsed){
            //     yield saveThreads(parsed[a].threads);
            // }

            async.eachSeries(pages, function iterator(page, cb) {
                console.log('wat');
                // console.log(page.threads);
                // getImg(post, board, callback);
                saveThreads(page.threads, cb);
                // cb();
            });
            // callback(threads);
            callback();
        });
    }

    function thread(thread, board, callback){
        // request('http://a.4cdn.org/' + board + '/thread/' + thread.no +'.json', function(error, response, body){
        request('http://a.4cdn.org/' + board + '/thread/' + thread +'.json', function(error, response, body){
            if(!body){return;}
            var parsed = JSON.parse(body);
            var posts = parsed.posts;
            iposts = Array();
            for(a in posts){
                // should do some analasys here

                // if the post has an image
                if(posts[a].tim){
                    iposts = iposts.concat(posts[a]);
                }
            }

            // workaround to get it to run after the for loop is completed
            setTimeout(function(){
                callback(iposts);
            },0);
        });

    }

    // allThreads('b', function(tlist){
    //
    //     return;
    //     // go thourgh all the threads in post and download the image
    //     for(i in tlist){
    //     // var i = 0;
    //         thread('b', tlist[i], function(posts){
    //                 console.log(posts.length);
    //                 async.eachSeries(posts, function iterator(post, callback) {
    //                     console.log(post.no);
    //                     getImg(post, board, callback);
    //                 });
    //         });
    //     }
    //
    // });


    // load all thread ids into db, all based on UTC time
    function populateThreads(){

        allThreads(board, function(tlist){
            // console.log(tlist);
            var stmt = db.prepare("INSERT INTO threads VALUES (?, ?, datetime(?, 'unixepoch', 'utc'), 0, datetime('now', 'utc'))");
            for(i in tlist){
                stmt.run(tlist[i].no, 'b', tlist[i].last_modified);
            }
            stmt.finalize();
        });
    }


    function populatePosts(board){
        db.each("SELECT * from threads", function(err, row) {
            // console.log(row.id);
            thread(row.id, row.board, function(thr){
                console.log(thr);
                // TODO: get this working
                db.run("INSERT INTO posts (id, text, threads_id, created) VALUES  (" +
                       thr.no + ", '"+ thr.com + "', " + row.id +"," + thr.time + ")");

            });
            // console.log(row);
            // return;
            // console.log(row.id + ": " + row.last_modified);
            // var stmt = db.run("INSERT INTO posts VALUES (, ?, datetime(?, 'unixepoch', 'utc'), 0, datetime('now', 'utc'))");
            //   console.log(row);
        });
    }

    var insertDocuments = function(db, callback) {
        // Get the documents collection
        var collection = db.collection('documents');
        // Insert some documents
        collection.insertMany([
            {a : 1}, {a : 2}, {a : 3}
        ], function(err, result) {
            assert.equal(err, null);
            assert.equal(3, result.result.n);
            assert.equal(3, result.ops.length);
            console.log("Inserted 3 documents into the document collection");
            callback(result);
        });
    }

    // populatePosts();
    // testa();
});
// nchan = new NodeChan();
// nchan.dbInit();
// setTimeout(function(){
//     console.log('then');
//     // nchan.testAll();
//     nchan.nextTest();
// }, 200);
