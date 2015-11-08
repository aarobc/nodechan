
var MongoClient = require('mongodb').MongoClient;//,
// assert = require('assert');

// Connection URL
var url = 'mongodb://mongo:27017/nodechan';

module.exports = MongoClient.connect(url, function(err, db) {
  // assert.equal(null, err);
  console.log("Connected correctly to server");
  return db;

  // db.close();
});
