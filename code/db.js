var co = require('co');
var mongo = require('mongodb').MongoClient;//,
var mdbUrl = 'mongodb://mongo:27017/nodechan';

module.exports = function(){

    var module = {};
    var var module.db = {};

    co(function*(){
        module.db = yield mongo.connect(mdbUrl);

        // module.getDB = function(){
        //     console.log('getting the thing');
        //     return db;
        // };

    });


    return module;
};
