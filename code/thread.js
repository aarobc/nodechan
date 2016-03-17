var async = require('async');
// var request = require('request');
var each = require('mongo-each');
var _ = require('underscore');

// var Promise = require('bluebird');
// var request = Promise.promisifyAll(require('request'));
var rp = require('request-promise');

module.exports = function(db, board){

    var module = {};
    var interval = {};
    module.board = board;

    function insert(threads){

        return new Promise(function(resolve, reject){

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
                var there = _.findWhere(threads, {no: dbThread.no});
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
                console.log(err);
                console.log('error?');
                async.eachSeries(threads, (item, cb2) => {
                    dbThreads.updateOne({no: item.no}, item, {upsert: true}, function(e, res){
                        // console.log(e);
                        cb2();
                    });
                }, function(){
                    // cb();
                    console.log('eeeee')
                    resolve('werked');
                });
            });

        });
    }
    // requests and returns array object of all
    module.saveAll = function(callback){

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
            console.log(threads);
            return threads;
            // insert(threads, callback);
            // insert(threads).then((resp) =>{
            //     console.log(resp);
            //     console.log('green screen');
            //     callback();
            // });
        });
    };

    // module.watch = function(refresh){
    //     interval = setInterval(function(){
    //         module.saveAll(function(){
    //             console.log('doneend');
    //             // db.close();
    //         });
    //     }, refresh);
    // };

    module.stop = function(){
        clearInterval(interval);
    }

    return module;
};
