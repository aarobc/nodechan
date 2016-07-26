/* Dependencies */
var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;
var rp = require('request-promise');

var db
var thrl
var config = {}
// getBoards();
var defaultBoard = 'wsg'

mongoClient.connectAsync('mongodb://mongo:27017/nodechan')
    .then((dba) => {
        db = dba;
        thrl = require('./threadList.js')(db, config.board)

        // set up the boards
        db.collection('threads').createIndex({"no": 1}, {unique: true})
        db.collection('posts').createIndex({"no": 1}, {unique: true})
        db.collection('posts').createIndex({"com": "text"})
        db.collection('config').createIndex({"board": 1}, {unique: true})
        db.collection('boards').drop()
        db.collection('boards').createIndex({"board": 1}, {unique: true})

        // TODO: find a more elegant way to do this
        //set up the config
        return db.collection('config')
        .findOneAsync({board :{$exists: true}}, {_id: 0})
    })
    .then(board => {
        if(!board){
            return db.collection('config')
            .insertAsync({board: defaultBoard})
        }
        else{
            return
        }
    })
    .then(() => {
        return db.collection('config')
        .findOneAsync({board :{$exists: true}}, {_id: 0})
    })
    .then(conf => {
        // setting configuration
        config = conf
        // will move this to be called elsewhere eventually
        thrl = require('./threadList.js')(db, config.board)
        // load the board info
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
    // var a = "green";
    thrl.processThreads().then((r) =>{
        console.log(r);
        return thrl.processPosts();
    });

}
