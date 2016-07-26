var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;

var collection = 'posts';

router.get('/', function(req, res) {
    var limit = (req.query.limit) ? Number(req.query.limit) : 20;
    var find = (req.query.no) ?
        {no: {$lt: Number(req.query.no)}, replies: { $exists: true }}
        :
        {replies: { $exists: true }};

    if(req.query.query){
        find.$text = {$search: req.query.query};
    }

    console.log(find);
    mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    .then(db => {
        var cursor = db.collection(collection)
        // .find({})
        .find(find, {_id: 0})
        .sort({no: -1})
        .limit(limit)

        return cursor.toArrayAsync();
    }).then(threads =>{
        res.send(threads);
        // console.log('apples');
        // res.send("potatoes");
    });
});

router.get('/:tid', function(req, res) {

    console.log(req.params.tid);
    mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    .then(db => {
        var cursor = db.collection(collection)
        .find({thread: parseInt(req.params.tid)}, {_id: 0})
        .sort({no: 1})

        return cursor.toArrayAsync();
    }).then(threads =>{
        res.send(threads);
    });

    // res.send(req.params.tid);
});

module.exports = router;
