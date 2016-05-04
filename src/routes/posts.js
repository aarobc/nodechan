var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;

var collection = 'posts';
router.get('/', function(req, res) {
    mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    .then(db => {
        var cursor = db.collection(collection)
        // .find({});
        .find({}, {_id: 0});

        return cursor.toArrayAsync();
    }).then(threads =>{
        res.send(threads);
        // console.log('apples');
        // res.send("potatoes");
    });
});
/* GET users listing. */
router.get('/:tid', function(req, res) {

    console.log(req.params.tid);
    mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    .then(db => {
        var cursor = db.collection(collection)
        // .find({});
        .find({thread: parseInt(req.params.tid)}, {_id: 0})
        .sort({no: -1})

        return cursor.toArrayAsync();
    }).then(threads =>{
        res.send(threads);
    });

    // res.send(req.params.tid);
});

module.exports = router;
