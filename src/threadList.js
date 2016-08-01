/* Dependencies */
var async = require('async')
var request = require('request')
var each = require('mongo-each')
var _ = require('lodash')
var fs = require('fs')
var http = require('http')
var url = require('url')
var Promise = require('bluebird')
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient

var rp = require('request-promise')

_.enhance = function(list, source) {
    return _.map(list, function(element) { return _.extend({}, element, source); })
}

module.exports = function(dbStr){

    var db = {}
    var module = {}
    var interval = {}
    module.board = 'wsg'
    var dbStr = 'mongodb://mongo:27017/nodechan'


    function insertThreads(threads){
        return new Promise((resolve, reject) => {

            // workaround because can't figure out a way to add it on the insert
            for(t of threads){
                t.deleted = false
            }

            var dbThreads = db.collection('threads')
            // getting all the stored threads
            // var cursor = dbThreads.find({})
            var cursor = dbThreads.find({deleted: false})

            each(cursor,{
                concurrency: 1000,
            }, function(dbThread, callb){
                var there = _.find(threads, {no: dbThread.no})
                if(!there){
                    // console.log('not there')
                    dbThreads.updateOne(dbThread, {$set: {deleted: true}}, function(err, result){
                        callb()
                    })
                }
                else{
                    callb()
                }

            }, function(err){
                // have to manually do the inserts because dumb
                async.eachSeries(threads, function(item, cb2){
                    dbThreads.updateOne({no: item.no}, item, {upsert: true}, function(e, res){
                        // console.log(e)
                        cb2()
                    })
                }, function(){
                    resolve({msg: 'inserted the thread list'})
                })
            })
        })
    }

// requests and returns array object of all
     module.processThreads = function(board){

        module.board = board

        var options = {
            uri:'http://a.4cdn.org/' + module.board + '/threads.json',
            json: true
        }

        return rp(options)
        .then(pages => {
            var threads = []

            for(i in pages){
                threads = threads.concat(pages[i].threads)
            }
            console.log(threads.length)
            console.log('insert threads')
            // insert(threads, callback)
            return insertThreads(threads)
        })

    }


    module.processPosts = function(){
        return new Promise((resolve, reject) => {
            var cursor = db.collection('threads')
            .find({deleted: false}, {no: 1, _id: 0})

            cursor.toArrayAsync()
            .then((threads) => {
                return mapSerial(threads, loadThread)
            })
            .then((val) => {
                console.log('processPosts done')
                var f = _.filter(val, 'downloaded')
                // console.log(f)
                // console.log(val)
                console.log(f.length)
                // return stuff
                resolve(val)
            })
        })
    }

    function loadThread(thread){

        var options = {
            uri:`http://a.4cdn.org/${module.board}/thread/${thread.no}.json`,
            json: true
        }

        return rp(options)
        .then(posts => {
            // console.log(posts.posts)
            posts = _.enhance(posts.posts, {thread: thread.no})
            console.log('posts length')
            console.log(module.board)
            console.log(posts.length)

            return mapSerial(posts, insertPost)
        }).catch(err => {
            console.log(err)
            console.log('err, probably not therr')
            resolve({msg: "thread probably does not exist exist"})
        })
        .then(res => {
            console.log('results length')
            console.log(res.length)
            var f = _.filter(res, 'downloaded')
            console.log('downloaded:' + f.length)
            // console.log(f)
            console.log(res)
            // resolve(res)
            return res
        })

    }

    function mapSerial(posts, method){

        // return new Promise(resolv => {

            var retd = Array()
            return Promise.reduce(posts, (pac, post) =>{
                retd.push(pac)
                return method(post)
            }, 0).then(val =>{
                retd.push(val)
                retd.shift()
                // resolv(retd)
                return retd
            })

        // })
    }

    function insertPost(post){

        return db.collection('posts').insertAsync(post)
        .then(res => {
            if(post.ext){
                return download(post)
            }
            return {msg: 'no image'}
        })
        .catch(err => {
            return {msg: 'already in db'}
        })


    }

    function download(post){
        console.log('download')
        return new Promise((resolv, reject) =>{
            var addr = `http://i.4cdn.org/${module.board}/${post.tim}${post.ext}`
            console.log(addr)
            var dest = `/cache/images/${post.tim}${post.ext}`

            var options = {
                host: url.parse(addr).host,
                port: 80,
                path: url.parse(addr).pathname
            }

            var file = fs.createWriteStream(dest)

            http.get(options, function(res) {
                res.on('data', function(data) {
                    file.write(data)
                }).on('end', function() {
                    file.end()
                    console.log('downloaded ' + addr)
                    resolv({downloaded: addr})
                })
            })
        })
    }

    module.connectDB = function(board){

        module.board = board
        console.log(dbStr)
        return mongoClient.connectAsync(dbStr)
        .then(dba => {
            db = dba
            console.log('connected')
            return dba
           // return module.processThreads(board)
           // return module.runScan(board)
        })
        .then((pr) => {
            console.log(pr)
            // return module.processPosts()
            // return 'alice'
        })
        // .then(out => {
        //     return 'motives'
        // })
    }

    module.runScan = function(board){

       return module.processThreads(board)
        .then(pr => {
            return module.processPosts()
        })
    }


    // function filter(terms){
    //     return new Promise(resolv =>{
    //
    //     })
    // }

    return module
}

