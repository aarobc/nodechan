var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a thread list');
});
/* GET users listing. */
router.get('/:uid', function(req, res) {
  console.log('potato');
  res.send(req.params.uid);
});

module.exports = router;
