var express =require('express');
var fs = require('fs');
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/page1', function (req,res){
res.sendfile(__dirname + '/page1.html');
});

io.set('log level', 2);
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('message', function(data){console.log("Message Sent Was: " + data);
  socket.emit('msgconfirm', 'Message successfully sent');
  });
  socket.on('play-song', function(data){
  	var filestring = "/nodeapps/public/files" + data;
fs.readFile('/etc/hosts', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  socket.emit('audio-stream',data);
});
  })
});