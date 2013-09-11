var express =require('express');
var fs = require('fs');
var MemoryStore = express.session.MemoryStore;
var store = new MemoryStore();
//var mongoose = require('mongoose');
var filehome = "C:/nodeapps/alarm-clock/public/files/";
var clients = {};
var alarms = [];
var users = {};
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var path = require('path');
app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieSession({ store: store, secret: 'secretkeysareforalarms', key: 'sid' }));
server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index2.html');
});

app.get('/getAlarms/:userid', function (req, res){

});

app.get('/getAudio/:filename', function (req, res){
var filename = req.params.filename;
var filestring = filehome + filename;
res.sendfile(filestring);
});

app.get('/listClients', function (req, res){
console.log(clients);
});

app.get('/listUsers', function(req, res){
console.log(users);
res.send(users);
});

app.get('/addSocket/:username/:socketid', function (req, res){
var username = req.params.username;
var socketid = req.params.socketid;
var curruser = users[username];
if(curruser == "" || curruser == undefined){
var currentuser = new Object();
currentuser.username = username;
currentuser.sockets = new Array();
currentuser.sockets.push(socketid);
users[username] = currentuser;
console.log('socket id: '+ socketid);
}
else{
users[username]['sockets'] = new Array();
users[username].sockets.push(socketid);
}
res.send(users);
});

setInterval(function(){
for (i=0; i<alarms.length; i++){
var curralarm = alarms[i];
var now = new Date();
if(now >= curralarm.alarmtime && curralarm.set == true){
sendAlarm(curralarm.username, curralarm);
}
}
},10000);

function sendAlarm(username, alarm){
var curruser = users[username];
for (var i=0; i<curruser.sockets; i++){
var currsocket = curruser.sockets[i];
currsocket.emit('alarm-event', alarm);
}
}

app.get('/getCookie/:cookie', function (req, res){
var cookiename = req.params.cookie;
var cookieval = req.cookies[cookiename]
res.send(cookieval);
});

io.set('log level', 2);
io.sockets.on('connection', function (socket) {
	clients[socket.id] = socket;
	socket.emit('socket-id', {socketid: socket.id});
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('message', function(data){console.log("Message Sent Was: " + data);
  socket.emit('msgconfirm', 'Message successfully sent');
  });
  socket.on('disconnect', function() {
    delete clients[socket.id];
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