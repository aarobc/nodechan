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
    var ws       = false

    var report = msg => {
        var msg = {msg: msg, done: false}
        console.log(msg)
        if(ws){
            var msg = JSON.stringify(msg)
            ws.send(msg)
        }
    }
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
                    // report('not there')
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
                        // report(e)
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
            report(threads.length)
            report('insert threads')
            // insert(threads, callback)
            return insertThreads(threads)
        }).catch(err => {
            report('catched!')
            report(err)
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
                report('processPosts done')
                var f = _.filter(val, 'downloaded')
                // report(f)
                // report(val)
                report(f.length)
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
            // report(posts.posts)
            posts = _.enhance(posts.posts, {thread: thread.no})
            report('posts length')
            report(board)
            report(posts.length)

            return mapSerial(posts, insertPost)
        }).catch(err => {
            // report(err)
            report('err, probably not therr')
            return {msg: "thread probably doesn't exist"}
        })
        .then(res => {
            report('results length')
            report(res.length)
            var f = _.filter(res, 'downloaded')
            report('downloaded:' + f.length)
            // report(f)
            report(res)
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
        report('download')
        return new Promise((resolv, reject) => {
            var addr = `http://i.4cdn.org/${board}/${post.tim}${post.ext}`
            report(addr)
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
                    report('downloaded ' + addr)
                    resolv({downloaded: addr})
                })
            })
        })
    }


    module.runScan = b => {
        board = b
        report(dbStr)
        return mongoClient.connectAsync(dbStr)
        .then(dba => {
            db = dba
            report('connected')
            return module.processThreads()
        })
        .then((pt) => {
            report(pt)
            return module.processPosts()
        })
        .then((pp) => {
            return db.closeAsync()
        })

    }

    module.setReport = s => {
        ws = s
    }


    // var filter = terms => {
    //     return new Promise(resolv =>{
    //
    //     })
    // }

    return module
}

