var express =require('express');
var fs = require('fs');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
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
app.use(express.cookieSession({ store: sessionStore, secret: 'secretkeysareforalarms', key: 'sid' }));
server.listen(8080);



io.set('authorization', function(data, accept){
 // check if there's a cookie header
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = require('cookie').parse(data.headers.cookie)
        // note that you will need to use the same key to grad the
        // session id, as you specified in the Express setup.
        data.sessionID = data.cookie['sid'];
		data.username = data.cookie['username'];
		console.log('data.sessionID is: ' + data.sessionID);
		data.sessionStore = sessionStore;
		console.log('data.sessionStore is: ' + data.sessionStore);
        sessionStore.load(data.sessionID, function (err, session) {
            if (err || !session) {
				console.log('Error was: ' + err);
				console.log('Session was: ' + session);
				console.log('No Session Detected');
                accept('Error', false);
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                data.session = session
                accept(null, true);
            }
			
        }); 
		}
		else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});

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
console.log('A socket with sessionID ' + socket.handshake.sessionID 
        + ' connected!');
	
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