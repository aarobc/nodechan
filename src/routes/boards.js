var express = require('express')
var Promise = require('bluebird')
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient
var router = express.Router()


var collection = 'boards'

var db = {}
var resp = {}
router.get('/', function(req, res) {

    mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    .then(dba => {
        db = dba
        var cursor = db.collection(collection)
        .find({}, {_id: 0})
        return cursor.toArrayAsync()
    })
    .then(bz => {

        resp.boards = bz
        return db.collection('config')
        .findOneAsync({board :{$exists: true}}, {_id: 0})
    })
    .then(conf => {
        resp.default = conf.board
        console.log(conf)
        res.send(resp);
    })
    .catch(err => {
        console.log(err)
        res.send('boards collection problem')
    })

});

router.put('/default', function(req, res) {

    console.log(req)
    // mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    // .then(db => {
    //     var cursor = db.collection(collection)
    //     .find({}, {_id: 0})
    //     return cursor.toArrayAsync()
    // }).then(boards =>{
    //     res.send({boards: boards});
    // }).catch(err => {
    //     console.log(err);
    //     res.send('boards collection problem');
    // });

});

module.exports = router;
