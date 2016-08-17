/* Dependencies */

var each        = require('mongo-each')
var Promise     = require('bluebird')
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient
var dbStr = 'mongodb://mongo:27017/nodechan'
thrl = require('./threadList.js')()

// mongoClient.connectAsync(dbStr)
// .then(db => {
//     return setupDB(db)
// })
// .then(e => {
//     console.log('potato')
// })
// .then(() => {
//
    thrl.runScan('wsg')
    .then(scan => {
        console.log(scan)
        return "nop"
    })
// })



function setupDB(db){
    // return new Promise((resolve, reject) => {
    var config = {board: 'wsg'}
    var rp = require('request-promise')

    db.collection('threads').drop()
    db.collection('posts').drop()
    db.collection('posts').drop()
    db.collection('config').drop()
    db.collection('boards').drop()

    db.collection('threads').createIndex({"no": 1}, {unique: true})
    db.collection('posts').createIndex({"no": 1}, {unique: true})
    db.collection('posts').createIndex({"com": "text"})
    db.collection('config').createIndex({"board": 1}, {unique: true})
    db.collection('boards').createIndex({"board": 1}, {unique: true})

    return db.collection('config').insertAsync(config)
    .then(() => {
        var opts = {
            uri: 'http://a.4cdn.org/boards.json',
            json: true
        }
        return rp(opts)
    })
    .catch(err => {
        console.log('err')
        console.log(err)
        debugger
    })
    .then(boards => {
        return db.collection('boards')
        .insertManyAsync(boards.boards)
    })
}
