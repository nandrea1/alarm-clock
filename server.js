var express =require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var port = process.env.PORT || 8080
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
server.listen(port);

/////// DB Functions ////////
mongoose.connect('mongodb://nandrea1:caca2tu5c@ds043378.mongolab.com:43378/alarm_db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('DB Connection Successful');
  
});

////// Schemas ///////

var alarmSchema = mongoose.Schema({
username: String,
set: Boolean,
time: String,
date: String,
datetime: String,
pandora_station: String,
grooveshark_link: String,
grooveshark_song: String,
radio_station: String,
snooze_time: Number,
complexity: String,
email_notify: Boolean,
notify_addresses: Array,
snooze_limit: Number,
gradual_volume: Boolean,
alarm_type: String,
music_area: String
});

var userSchema = mongoose.Schema({
username: String,
password: String,
email: String,
date_created: String,
first_name: String,
last_name: String,
last_login: String,
dob: String,
facebook_login: Boolean,
facebook_auth_token: String,
facebook_auth_expiry: String,
google_login: Boolean,
google_auth_token: String,
google_auth_expiry: String,
active_sockets: Array,
session_id: String

});

var clientSchema = mongoose.Schema({
username: String,
sessionid: String,
Sockets: Array
});

var socketSchema = mongoose.Schema({
socket: String,
connected_on: String
})

///// Models /////

var Socket = mongoose.model('Socket', socketSchema);
var User = mongoose.model('User', userSchema);
var Client = mongoose.model('Client', clientSchema);
var Alarm = mongoose.model('Alarm', alarmSchema);
/////// Routes //////


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index2.html');
});


app.get('/getAudio/:filename', function (req, res){
var filename = req.params.filename;
var filestring = filehome + filename;
res.sendfile(filestring);
});

app.get('/listClients', function (req, res){
console.log(clients);
res.send(clients);
});

app.get('/listUsers', function(req, res){
console.log(users);
res.send(users);
});


setInterval(function(){
for (i=0; i<alarms.length; i++){
//console.log('Alarm Found!');
var curralarm = alarms[i];
//console.log('Number of alarms is: ' + alarms.length);
var now = new Date();
var alarmdate = new Date(curralarm.datetime);
//console.log('Now is: ' + now.getTime());
//console.log('Alarm Date is: ' + alarmdate.getTime());
//console.log('Alarm Set status is: ' + curralarm.set);
if(now.getTime() >= alarmdate.getTime() && curralarm.set == true){
console.log('Sending Alarm from check function');
//console.log('alarm debug info: ' + JSON.stringify(curralarm));
sendAlarm(curralarm.username, curralarm);
}
}
//if(alarms.length == 0){console.log('Number of alarms is: ' + alarms.length);}
},1000);

function sendAlarm(username, alarm){
console.log('alarm set by user ' + username + ' activated. alarm time was ' + alarm.datetime + ' and current time is ' + new Date());
var curruser = users[username];
var usersockets = curruser.sockets;
var socketslength = usersockets.length;
console.log('User ' + username + ' has ' + socketslength + ' sockets');
for (var i=0; i<socketslength; i++){
console.log('socket is: ' + usersockets[i]);
var currsocket = usersockets[i];
currsocket.emit('alarm-event', alarm);
var alarmindex = alarms.indexOf(alarm);
	if(alarmindex > -1){
	alarms.splice(alarm, 1);
	}
}
}

function getSockets(username){
var user = users[username];
return user.sockets;
}

function getAlarms(username){
alarmlist = new Array();
for(var i=0; i<alarms.length; i++){
var alarmuser = alarms[i].username;
if(alarmuser == username){alarmlist.push(alarms[i]);}
}
return alarmlist;
}

/////Socket IO Functions and Events/////


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
		console.log('username is: ' + data.username);
		data.sessionStore = sessionStore;
		}
		else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});


io.set('log level', 2);
io.sockets.on('connection', function (socket) {
console.log('A socket with sessionID ' + socket.handshake.sessionID 
        + ' connected!');
	//var sockstring = JSON.stringify(socket);
	//console.log(socket);
	var sock = new Socket({socket: socket.id, connected_on: new Date()});
	sock.save(function (err) {
	if (err) return handleError(err);
		console.log('socket saved to db');
		})
	clients[socket.id] = socket;
	if(socket.handshake.username == undefined || socket.handshake.username == ""){
	var currentusername = socket.handshake.sessionID;
	}
	else{
	var currentusername = socket.handshake.username;
	}
	var curruser = users[currentusername];
	var curru = User.find({ username: currentusername});
	console.log('current user is: ' + curru);
	if(curruser =="" || curruser == undefined){
	curruser = new Object();
	curruser.username = currentusername;
	curruser.sockets = new Array();
	curruser.sockets.push(socket);
	curruser.sessionid = socket.handshake.sessionID;
	users[currentusername] = curruser;
	}
	else{
	curruser.sockets.push(socket);
	users[currentusername] = curruser;
	}
	var alarmlist = getAlarms(currentusername);
	socket.emit('socket-id', {socketid: socket.id});
	socket.emit('session-id', {sessionid: socket.handshake.sessionID});
	socket.emit('send-alarms', {alarms: alarmlist});
	
  

  
  socket.on('disconnect', function() {
	var deletinguser = users[currentusername];
	console.log('user ' + deletinguser.username + ' disconnected socket ' + socket.id);
	Socket.remove({socket: socket.id}, function (err) {
	if (err) return handleError(err);
		console.log('socket '+socket.id+' removed from db');
		});
		
	var socketindex = deletinguser.sockets.indexOf(socket);
	if(socketindex > -1){
	deletinguser.sockets.splice(socketindex, 1);
	}
	else{
	console.log('Could not find socket. Maybe was already disconnected?');
	}
	users[currentusername] = deletinguser;
    delete clients[socket.id];
  });
  
  socket.on('connected-clients', function(data){
console.log(clients);
});

socket.on('connected-users', function(data){
console.log(users);
});

socket.on('sockets-by-user', function(data){
var user = users[data.username];
console.log(user);
});

socket.on('add-alarm', function(data){
console.log('adding alarm with date: ' + data.datetime);
alarms.push(data);
});

socket.on('remove-alarm', function(data){
var alarmdate = data.datetime;
console.log('removing alarm with date: ' + alarmdate);
for(var i=0; i<alarms.length; i++){
var currtime = alarms[i].datetime;
var curruser = alarms[i].username;
if(data.datetime == currtime && data.username == curruser){
alarms.splice(i, 1);
}
}
});

socket.on('silence-alarm', function(data){
var uname = data.username;
console.log('silencing alarm for ' + uname);
var currsockets = getSockets(uname);
for(var i=0; i<currsockets.length; i++){
currentsocket = currsockets[i];
currentsocket.emit('silence-alarm', {silencedate: new Date(), username: data.username, alarm: data});
}
});

socket.on('list-alarms', function(data){
console.log(alarms);
});
  
  
  socket.on('play-song', function(data){
  	var filestring = "/nodeapps/public/files" + data;
fs.readFile('/etc/hosts', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  socket.emit('audio-stream',data);
});
  });
  
});