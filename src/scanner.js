/* Dependencies */
// var Promise = require('bluebird')
// var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient
var rp = require('request-promise')

var dbStr = 'mongodb://mongo:27017/nodechan'

thrl = require('./threadList.js')(dbStr)


thrl.connectDB()
.then(db => {
    console.log('twac')
    return thrl.runScan('b')
})
.then(dat => {
    console.log(dat)
    process.exit()
})

// .then(dat => {
//     console.log(dat)
// })

// mongoClient.connectAsync(dbStr)
// .then(db => {
//     thrl = require('./threadList.js')(dbStr, db)
//     return thrl.runScanner()
// })
// .then(dat => {
//     console.log('done')
//     process.exit()
//
// })

// .then(res => {
//     console.log('done')
//     process.exit()
// })
function runScanner(){

    mongoClient.connectAsync(dbStr)
    .then((dba) => {
        db = dba
        thrl = require('./threadList.js')(dbStr, db)
        return setupDB()
    })
    .then(sdb => {
        return thrl.processThreads('b')
    })
    .catch((err) => {
        throw err
    })
    .then((pr) => {
        console.log(pr)
        return thrl.processPosts()
    })
    .then(pp => {
        process.exit()
    })
    .catch((err) => {
        console.log(err)
        process.exit()
        // throw err
    })
}

// runScanner()

function setupDB(){
    // return new Promise((resolve, reject) => {
    var config = {board: 'wsg'}

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
    // })
}
