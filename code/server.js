/* Dependencies */
var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;
var rp = require('request-promise');

var board = 'b';
var db;
var thrl;

mongoClient.connectAsync('mongodb://mongo:27017/mydb')
    .then((dba) => {
        db = dba;
        thrl = require('./threadList.js')(db, board);
        db.collection('threads').createIndex({"no": 1}, {unique: true});
        db.collection('posts').createIndex({"no": 1}, {unique: true});

        return "12";
    })
    .then((cur) => {
        console.log(cur);
        return process();
    })
    .then((content) => {
        console.log(content);
        // res.status(200).json(content);
    })
    .catch((err) => {
        throw err;
    });

function process(){
    var a = "green";
    thrl.processThreads().then((r) =>{
        a = r;
        console.log(r);
        thrl.processPosts();
        return r;
    });
    return a;

}
