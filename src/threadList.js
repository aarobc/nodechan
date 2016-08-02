/* Dependencies */
var async       = require('async')
var request     = require('request')
var each        = require('mongo-each')
var _           = require('lodash')
var fs          = require('fs')
var http        = require('http')
var url         = require('url')
var rp          = require('request-promise')
var Promise     = require('bluebird')
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient

var dbStr = 'mongodb://mongo:27017/nodechan'

// method for adding property to array of objects
_.enhance = (list, source) => {
    return _.map(list, element => { return _.extend({}, element, source) })
}

module.exports = () => {

    var db       = {}
    var module   = {}
    var interval = {}
    var board    = 'wsg'

    var insertThreads = threads => {
        return new Promise((resolve, reject) => {

            // workaround because can't figure out a way to add it on the insert
            for(t of threads){
                t.deleted = false
            }

            var dbThreads = db.collection('threads')
            // getting all the stored threads
            var cursor = dbThreads.find({deleted: false})

            each(cursor,{
                concurrency: 1000,
            }, (dbThread, callb) => {
                var there = _.find(threads, {no: dbThread.no})
                if(!there){
                    // console.log('not there')
                    dbThreads.updateOne(dbThread, {$set: {deleted: true}}, (err, result) => {
                        callb()
                    })
                }
                else{
                    callb()
                }

            }, (err) => {
                // have to manually do the inserts because dumb
                async.eachSeries(threads, (item, cb2) => {
                    dbThreads.updateOne({no: item.no}, item, {upsert: true}, (e, res) => {
                        // console.log(e)
                        cb2()
                    })
                }, () => {
                    resolve({msg: 'inserted the thread list'})
                })
            })
        })
    }

    // requests and returns array object of all
    module.processThreads = () => {

        var options = {
            uri:'http://a.4cdn.org/' + board + '/threads.json',
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
        }).catch(err => {
            console.log('catched!')
            console.log(err)
        })

    }


    module.processPosts = () => {
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

    var loadThread = thread => {

        var options = {
            uri:`http://a.4cdn.org/${board}/thread/${thread.no}.json`,
            json: true
        }

        return rp(options)
        .then(posts => {
            // console.log(posts.posts)
            posts = _.enhance(posts.posts, {thread: thread.no})
            console.log('posts length')
            console.log(board)
            console.log(posts.length)

            return mapSerial(posts, insertPost)
        }).catch(err => {
            // console.log(err)
            console.log('err, probably not therr')
            return {msg: "thread probably doesn't exist"}
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

    var mapSerial = (posts, method) => {

        var retd = Array()
        return Promise.reduce(posts, (pac, post) =>{
            retd.push(pac)
            return method(post)
        }, 0)
        .then(val =>{
            retd.push(val)
            retd.shift()
            return retd
        })
    }

    var insertPost = post => {

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

    var download = post => {
        console.log('download')
        return new Promise((resolv, reject) => {
            var addr = `http://i.4cdn.org/${board}/${post.tim}${post.ext}`
            console.log(addr)
            var dest = `/cache/images/${post.tim}${post.ext}`

            var options = {
                host: url.parse(addr).host,
                port: 80,
                path: url.parse(addr).pathname
            }

            var file = fs.createWriteStream(dest)

            http.get(options, res => {
                res.on('data', data => {
                    file.write(data)
                }).on('end', () => {
                    file.end()
                    console.log('downloaded ' + addr)
                    resolv({downloaded: addr})
                })
            })
        })
    }


    module.runScan = b => {
        board = b
        console.log(dbStr)
        return mongoClient.connectAsync(dbStr)
        .then(dba => {
            db = dba
            console.log('connected')
            return module.processThreads()
        })
        .then((pt) => {
            console.log(pt)
            return module.processPosts()
        })
        .then((pp) => {
            return db.closeAsync()
        })

    }


    // var filter = terms => {
    //     return new Promise(resolv =>{
    //
    //     })
    // }

    return module
}

