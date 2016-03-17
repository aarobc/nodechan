/* Dependencies */
var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;
var rp = require('request-promise');

var options = {
    uri: 'http://a.4cdn.org/b/threads.json',
    json: true // Automatically parses the JSON string in the response
};
var board = 'b';
var db;
var thrl;
// rp(options)
//     .then( (repos) => {
//         console.log(repos);
//     })
//     .catch( (err) => {
//         console.log(err);
//     });

mongoClient.connectAsync('mongodb://mongo:27017/mydb')
    .then((dba) => {
        db = dba;
        thrl = require('./threadList.js')(db, board);
        // return db.collection('content').findAsync({})
        // return  db.collection('posts').insertAsync({mike: 'wizouski'});
        return "12";
    })
    .then((cur) => {
        console.log(cur);
        // return  dbc.collection('posts').insertAsync({mike: 'eizouski'});
        // return cursor.toArrayAsync();
        return process();
        // return "13";
    })
    .then((content) => {
        console.log(content);
        // res.status(200).json(content);
    })
    .catch((err) => {
        throw err;
    });

function process(){
    // thrl.watch(10000);
    thrl.saveAll( () => {
        console.log('potatoes');
    } );
    return "23";
    // return thrl.saveAll();

}
