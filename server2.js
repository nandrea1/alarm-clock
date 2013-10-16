var express =require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var port = process.env.PORT || 8080
//var mongoose = require('mongoose');
var filehome = "C:/nodeapps/alarm-clock/public/files/";
var clients = [];
var alarms = [];
var users = [];
var sockets = [];
var dberror = false;
//var connectstring = 'mongodb://nandrea1:caca2tu5c@ds043378.mongolab.com:27017/alarm_db';
var connectstring = 'mongodb://admin:alarmclockdev@localhost:27017/alarm-clock-db'
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var path = require('path');
app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieSession({ store: sessionStore, secret: 'secretkeysareforalarms', key: 'sid' }));
server.listen(port);

/////// DB Functions ////////
mongoose.connect(connectstring);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('error', function(){dberror=true});
db.once('open', function callback () {
  console.log('DB Connection Successful');
  
});

////// Schemas ///////

var alarmSchema = mongoose.Schema({
username: String,
is_set: Boolean,
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

alarmSchema.methods.trigger = function(){

console.log('alarm set by user ' + this.username + ' activated. alarm time was ' + this.datetime + ' and current time is ' + new Date());
getObject("user", "username", this.username, function(result){
result[0] = new User(result[0]);
result[0].sendAlarm(this);
this.is_set = false;
if(!dberror){
this.save();
}
});
}




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

userSchema.methods.sendAlarm = function(alarm){
for (var i=0; i<this.active_sockets.length; i++){
var currsocket = this.active_sockets[i];
console.log('sending alarm to socket ' + currsocket);
currsocket.emit('alarm-event', alarm);
}
}

var clientSchema = mongoose.Schema({
username: String,
sessionid: String,
socket: String,
connected_on: String
});


///// Models /////

var User = mongoose.model('User', userSchema);
var Client = mongoose.model('Client', clientSchema);
var Alarm = mongoose.model('Alarm', alarmSchema);
/////// Routes //////


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index2.html');
});

app.get('/getLocalAlarms', function (req, res) {
  console.log(alarms);
  res.send(alarms);
});

app.get('/getLocalUsers', function (req, res) {
  console.log(users);
  res.send(users);
});

app.get('/getDBUsers', function (req, res) {
  User.find({}).exec(function(err, result){
   if(!err){
  console.log(result);
  res.send(result);
  }
  else{
  console.log("Error Detected retrieving Users from DB");
  res.send("Error Detected retrieving Users from DB");
  }
});
});
app.get('/getSockets', function (req, res) {
	var socketidarray = new Array();
	for(var i =0; i<sockets.length; i++){
	var socket = sockets[i];
	socketidarray.push(socket.id);
	}
  console.log(sockets);
  res.send(socketidarray);
});

app.get('/getLocalClients', function (req, res) {
  console.log(clients);
  res.send(clients);
});

app.get('/getDBClients', function (req, res) {
  Client.find({}).exec(function(err, result){
  if(!err){
  console.log(result);
  res.send(result);
  }
  else{
  console.log("Error Detected retrieving Clients from DB");
  res.send("Error Detected retrieving Clients from DB");
  }
});
});
/***** Service Functions *****/

setInterval(function(){
if(!dberror){
Alarm.find().exec(function(err,obj){
alarms = obj;
});
}
for (i=0; i<alarms.length; i++){
var curralarm = alarms[i];
var now = new Date();
var alarmdate = new Date(curralarm.datetime);

if(now.getTime() >= alarmdate.getTime() && curralarm.is_set == true){
curralarm = new Alarm(curralarm);
console.log('Sending Alarm triggered by check function');
curralarm.trigger();
}
}
},1000);

/***** --------------- *****/

/***** Event Driven Functions *****/

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

/***** ------------------- ******/

/***** Miscellaneous (Utility) Functions *****/

function arrayFunction (command, array, searchobj, property){

if(command == "search"){
console.log("Search Command Detected");
var searchstring = JSON.stringify(searchobj);
for(var i=0; i<array.length; i++){
var currobj = array[i];
var currobjstring = JSON.stringify(currobj);
if(currobjstring == searchstring){
console.log("Match Found");
return {object: currobj, index: i};
}
}
console.log("No Match Found");
}

if(command == "delete"){
console.log("Delete Command Detected");
try{
var searchstring = JSON.stringify(searchobj);
}
catch (e){
console.log("Could not stringify search string");
console.log(e);
}
for(var i=0; i<array.length; i++){
var currobj = array[i];
var currobjstring = JSON.stringify(currobj);
if(currobjstring == searchstring){
console.log("Match Found. Deleting Object");
array.splice(i,1);
return array;
}
}
console.log("No Match Found for Deletion");
return array;
}

if(command == "search-property"){
var resultarray = [];
console.log("Search Property Command Detected");
var searchprop = searchobj;
for(var i=0; i<array.length; i++){
var currobj = array[i];
var currprop = currobj[property];

if(currprop == searchprop){
console.log("Matching Property Found");
resultarray.push({object: currobj, index: i});
}

}
return resultarray;
}

if(command == "delete-property"){
console.log("Delete Property Command Detected");
var resultarray = [];
var searchprop = searchobj;

for(var i=0; i<array.length; i++){
var currobj = array[i];
var currprop = currobj[property];

if(currprop != searchprop){
console.log("Matching Property Found. Deleting object");
resultarray.push(currobj);
}

}
return resultarray;
}

}

function getObject(modelname, property, value, cb){
var model;
var array;
if(modelname == "user"){
	model = User;
	array = users;
}

else if(modelname == "client"){
	model = Client;
	array = clients;
}

else if(modelname == "alarm"){
	model = Alarm;
	array = alarms;
}
else if(modelname == "socket"){
	array == sockets;
}
else{
	console.log("No Schemas with name " + modelname + " found.");
	return "error";
}
if(dberror){
	console.log("Cannot run DB Queries, error connecting to DB. Using Local Collections");
	var res = arrayFunction('search-property', array, value, property);
	cb(res);
}
else{
	model.find({ property: value}).exec(function(err, result){
	if(err){
	console.log("Error finding " + property + " with value " + value + " in " + modelname + ". Using Local collections");
	var res = arrayFunction('search-property', array, value, property);
	cb(res);
			}
	else{
	cb(result);
		}
});
}
}
/***** ---------------------------------- *****/


function getAlarms(username, socket){
if(!dberror){
Alarm.find().exec(function(err, obj){
if(err){console.log('error when retrieving alarm list'); return}
var alarmlist = obj;
console.log(obj);
console.log("JSON String: " + JSON.stringify(obj));
socket.emit('send-alarms', {alarms: alarmlist});
});
}
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

	sockets.push(socket);
	if(socket.handshake.username == undefined || socket.handshake.username == ""){
	var currentusername = socket.handshake.sessionID;
	}
	else{
	var currentusername = socket.handshake.username;
	}
	var client = new Client({sessionid: socket.handshake.sessionID, socket: socket.id, username: currentusername});
	clients.push(client);
	client.save(function (err) {
	if (err) return handleError(err);
		console.log('Client saved to db');
		});
	var localuser = arrayFunction("search-property", users, currentusername, "username");
	console.log("Saving User");
	if(!dberror){
	User.find({ username: currentusername}).exec(function(err, result){
	if(!err){
	if(result.length == 0){
	console.log("No Database user with username " + currentusername + " found");
	if(localuser.length == 0){
	var usersockets = new Array();
	usersockets.push(socket.id);
	localuser = new User({username: currentusername, session_id: socket.handshake.sessionID, active_sockets: usersockets});
	users.push(localuser);
	localuser.save(function (err) {
	if (err) return handleError(err);
		console.log('User saved to db');
		});
	}
	else{
	curruser = localuser[0].object;
	curruser.active_sockets.push(socket.id);
	var ind = localuser[0].index;
	users[ind] = curruser;
	}
	
	}
	else{
	result.active_sockets.push(socket.id);
		result.save(function (err) {
	if (err) return handleError(err);
		console.log('User updated in db');
		});
	}
	
	
	}
	else{
	console.log("Error Querying User in DB");
	console.log("Error: " + err);
	console.log("Attempting Local Storage");
	
	if(localuser.length == 0){
	console.log("Local User Not Found");
	var usersockets = new Array();
	usersockets.push(socket.id);
	localuser = new User({username: currentusername, session_id: socket.handshake.sessionID, active_sockets: usersockets});
	users.push(localuser);
	}
	else{
	curruser = localuser[0].object;
	curruser.active_sockets.push(socket.id);
	var ind = localuser[0].index;
	users[ind] = curruser;
	}
	
	}
	});
	}
	else{
	console.log('Cannot run db functions on disconnected DB');
	var localuser = arrayFunction("search-property", users, currentusername, "username");
	console.log('User: ' + JSON.stringify(localuser));
	if(localuser.length == 0){
	console.log("Local User Not Found");
	var usersockets = new Array();
	usersockets.push(socket.id);
	localuser = new User({username: currentusername, session_id: socket.handshake.sessionID, active_sockets: usersockets});
	users.push(localuser);
	}
	else{
	curruser = localuser[0].object;
	curruser.active_sockets.push(socket.id);
	var ind = localuser[0].index;
	users[ind] = curruser;
	}
	}
	
	var alarmlist = getAlarms(currentusername);
	socket.emit('socket-id', {socketid: socket.id});
	socket.emit('session-id', {sessionid: socket.handshake.sessionID});
	socket.emit('send-alarms', {alarms: alarmlist});
	
  
  socket.on('disconnect', function() {
	
	var deleteobj = arrayFunction("search-property", users, currentusername, "username");
	var deletinglocaluser = deleteobj[0].object;
	var deleteindex = deleteobj[0].index;
	console.log('user ' + deletinglocaluser.username + ' disconnected socket ' + socket.id);
	sockets = arrayFunction("delete-property", sockets, socket.id, "id");
		
	var socketindex = deletinglocaluser.active_sockets.indexOf(socket.id);
	if(socketindex > -1){
	deletinglocaluser.active_sockets.splice(socketindex, 1);
	if(!dberror){
	User.find({username: deletinglocaluser.username}).exec(function(err,obj){
	if(!err){
	obj.active_sockets.splice(socketindex, 1);
	obj.save();
	}
	else{console.log("error looking up user to delete sockets");}
	});
	}
	}
	else{
	console.log('Could not find socket. Maybe was already disconnected?');
	}
	users[deleteindex] = deletinglocaluser;
    clients = arrayFunction("delete", clients, client);
	if(!dberror){
	Client.find({id: client.id}).remove();
	}
	else{
	console.log("Cannot connect to DB to delete client");
	}
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
