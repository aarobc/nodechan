var express      = require('express')
var path         = require('path')
var favicon      = require('serve-favicon')
var logger       = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser   = require('body-parser')

// routes
var routes       = require('./routes/index')
var threads      = require('./routes/threads')
var posts        = require('./routes/posts')
var boards       = require('./routes/boards')
// var socket       = require('./routes/socket')
// setup
var app          = express()
var expressWs    = require('express-ws')(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('/cache/images'));


app.use('/', routes);
app.use('/api/threads', threads);
app.use('/api/posts', posts);
app.use('/api/boards', boards);
// app.use('/api/scan', socket);
app.ws('/api/scan', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
    });
    console.log('socket', req.testing);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
