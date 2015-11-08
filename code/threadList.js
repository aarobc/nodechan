var async = require('async');
var request = require('request');
var _ = require('underscore');

module.exports = function(db, board){

    var module = {};
    module.board = board;

    function insert(threads, cb){

        var dbThreads = db.collection('threads');
        // getting all the stored threads
        var cursor = dbThreads.find({});
        cursor.each(function(err, dbThread){
            if(dbThread == null){
                return;
            }
            // console.log(dbThread);
            // console.log(err);
            // console.log("what");

            var there = _.findWhere(threads, {no: dbThread.no});
            if(!there){
                console.log('not there');
                // console.log(dbThread);
                dbThreads.updateOne(dbThread, {$set: {deleted: true}}, function(err, result){
                    // console.log(err);
                    // TODO: left off here
                    console.log(result);
                    console.log('done?');
                    cb();
                });
                // dbThread.update
            }
            // console.log(there);
            // var match = threads.find(function(dbThread){
            //     if(element.no == dbThread.no){
            //         return false;
            //     }
            //     else{}
            // });
        });
        // threads.insertMany(thrds, function(err, result){
            // console.log(err);
            // console.log(result);
            // console.log('insert done maybe');
            // cb();
        // });
    };
    // requests and returns array object of all
    module.saveAll = function(callback){

        var addr = 'http://a.4cdn.org/' + module.board + '/threads.json';
        console.log(addr);
        request(addr, function(error, response, body){
            var pages = JSON.parse(body);
            var threads = [];

            for(i in pages){
                threads = threads.concat(pages[i].threads);
            }
            // console.log(threads);

            insert(threads, callback);
            // async.eachSeries(pages, function iterator(page, cb) {
            //     console.log('wat');
            //     // insert(page.threads, cb);
            // }, function done(){
            //     callback();
            // });
        });
    };

    return module;
};
