var express = require('express'),
  app = express.createServer(),
  sys = require('sys'),
  twitter = require('twitter'),
  io = require('socket.io'),
  haml = require('hamljs');

var twit = new twitter({
  consumer_key: '', /* twitter consumer key */
  consumer_secret: '', /* twitter consumer secret */
  access_token_key: '', /* twitter access token key */
  access_token_secret: '' /* twitter access token secret */
});

var socket = io.listen(app); 
socket.on('connection', function(client){ 
  twit.stream('statuses/filter', {track:'isturnedonby'}, function(stream) {
    stream.on('data', function (data) {
      client.send(data);
    });
  });
});

app.configure(function(){
  app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  
  app.set('view engine', 'haml');
  app.register('.haml', require('hamljs'));
});

app.get('/', function(req, res){
  res.render('index', {
    locals: {title: 'Trends'}
  });
});

app.listen(3000);