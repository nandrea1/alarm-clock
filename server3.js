var express =require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var http = require('http');
var Logger = require('./Logger');
var rest = require('./restler');
var querystring = require('querystring');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var port = process.env.PORT || 8080
//var mongoose = require('mongoose');
var filehome = "C:/nodeapps/alarm-clock/public/files/";
var clients = [];
var alarms = [];
var users = [];
var sockets = {};
var groovesharkkey = 'b25a7402df222ad00acd2030db1065ad';
var groovesharkroot = 'http://tinysong.com/b/';
var dberror = false;
var connectremotestring = 'mongodb://nandrea1:caca2tu5c@ds043378.mongolab.com:27017/alarm_db';
var connectlocalstring = 'mongodb://admin:alarmclockdev@localhost:27017/alarm-clock-db'
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var path = require('path');
var logger = new Logger.Logger('info');
app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieSession({ store: sessionStore, secret: 'secretkeysareforalarms', key: 'sid' }));
server.listen(port);

/////// DB Functions ////////
mongoose.connect(connectremotestring);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('error', function(){
logger.info('falling back to local database');
mongoose.connect(connectlocalstring);
var db = mongoose.connection;
db.on('error', function(){logger.info('could not connect to remote or local db');
dberror = true;
});

});
db.once('open', function callback () {
  logger.info('DB Connection Successful');
  
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
alarm_volume: Number,
music_area: String
});

alarmSchema.methods.trigger = function(){

logger.info('alarm set by user ' + this.username + ' activated. alarm time was ' + this.datetime + ' and current time is ' + new Date());
var th = this;
User.findOne({username: this.username}, function(err, obj){
if(err){console.log(err); return}
obj.sendAlarm(th);
th.is_set = false;
th.save();
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
var currsocketid = this.active_sockets[i];
logger.info('sending alarm to socket with id ' + currsocketid);
var currsocket = sockets[currsocketid];
logger.trace(currsocket);
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
User.find().remove();
Client.find().remove();
Alarm.find().remove();
/////// Routes //////


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index2.html');
});


app.get('/getAlarms', function (req, res) {
  Alarm.find({}).exec(function(err, result){
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

app.get('/xDomainTest', function (req, res){

var post_data = querystring.stringify({
      'method' : 'getResultsInitial',
      'startindex': 0,
      'pagesize': 15,
        'r' : 90037418
  });
  
   var post_options = {
      host: 'https://lendingclub.com',
      port: '80',
      path: '/browse/browseNotesAj.action?',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };
  
 var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
		  res.send(data);
      });
  }).on('error',function(e){
   console.log("Error: \n" + e.message); 
   console.log( e.stack );
});;

  // post the data
  post_req.write(post_data);
  post_req.end();




/*var data = {method: 'getResultsInitial', startindex:0, pagesize:15, r:90037418};
var url = 'https://www.lendingclub.com/browse/browseNotesAj.action?';
rest.post(url, {data: data}).on('complete', function(data, response){
console.log(data);
console.log(response);
res.send(data);
});*/
});

app.get('/getUsers', function (req, res) {
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

app.get('/searchSong/:searchstring', function(req, res){
var searchurl = groovesharkroot + req.params.searchstring + '?format=json&key=' + groovesharkkey;
logger.info('requesting ' + searchurl);
rest.get(searchurl).on('complete', function(data) {
  logger.info(data)
  res.send(data);
});
});

app.get('/getClients', function (req, res) {
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
for (i=0; i<alarms.length; i++){
var curralarm = alarms[i];
curralarm = new Alarm(curralarm);
var now = new Date();
var alarmdate = new Date(curralarm.datetime);
if(now.getTime() >= alarmdate.getTime() && curralarm.is_set == true){
logger.info('Sending Alarm triggered by check function');
curralarm.trigger();
}
}
});
}
},1000);

/***** --------------- *****/

/***** Event Driven Functions *****/



/***** ------------------- ******/

/***** Service Call Functions *****/


/***** -------------------- ******/

/***** Miscellaneous (Utility) Functions *****/

function sendDataToUser(username, event, data){
User.findOne({username: username}, function (err, obj){
if(err){logger.info(err); return;}
for(var i=0; i<obj.active_sockets.length; i++){
var currsocketid = obj.active_sockets[i];
var currsocket = sockets[currsocketid];
currsocket.emit(event, data);
}
});
}

function arrayFunction (command, array, searchobj, property){

if(command == "search"){
logger.info("Search Command Detected");
var searchstring = JSON.stringify(searchobj);
for(var i=0; i<array.length; i++){
var currobj = array[i];
var currobjstring = JSON.stringify(currobj);
if(currobjstring == searchstring){
logger.info("Match Found");
return {object: currobj, index: i};
}
}
logger.info("No Match Found");
}

if(command == "delete"){
logger.info("Delete Command Detected");
try{
var searchstring = JSON.stringify(searchobj);
}
catch (e){
logger.info("Could not stringify search string");
console.log(e);
}
for(var i=0; i<array.length; i++){
var currobj = array[i];
var currobjstring = JSON.stringify(currobj);
if(currobjstring == searchstring){
logger.info("Match Found. Deleting Object");
array.splice(i,1);
return array;
}
}
logger.info("No Match Found for Deletion");
return array;
}

if(command == "search-property"){
var resultarray = [];
logger.info("Search Property Command Detected");
var searchprop = searchobj;
for(var i=0; i<array.length; i++){
var currobj = array[i];
var currprop = currobj[property];
if(currprop == searchprop){
logger.info("Matching Property Found");
resultarray.push({object: currobj, index: i});
}

}
return resultarray;
}

if(command == "delete-property"){
logger.info("Delete Property Command Detected");
var resultarray = [];
var searchprop = searchobj;

for(var i=0; i<array.length; i++){
var currobj = array[i];
var currprop = currobj[property];

if(currprop != searchprop){
logger.info("Matching Property Found. Deleting object");
resultarray.push(currobj);
}

}
return resultarray;
}

}

/***** ---------------------------------- *****/


function getAlarms(username, socket){
if(!dberror){
Alarm.find().exec(function(err, obj){
if(err){logger.info('error when retrieving alarm list'); return}
var alarmlist = obj;
if(alarmlist == "" || alarmlist == undefined){alarmlist = "";}
logger.debug("Alarm Object: " + obj);
socket.emit('send-alarms', {alarms: alarmlist});
});
}
else{
logger.info("DB Error Detected");
}
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
		logger.info('data.sessionID is: ' + data.sessionID);
		logger.info('username is: ' + data.username);
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
logger.info('A socket with sessionID ' + socket.handshake.sessionID 
        + ' connected!');

	//sockets.push(socket);
	sockets[socket.id] = socket;
	if(socket.handshake.username == undefined || socket.handshake.username == ""){
	var currentusername = socket.handshake.sessionID;
	}
	else{
	var currentusername = socket.handshake.username;
	}
	var client = new Client({sessionid: socket.handshake.sessionID, socket: socket.id, username: currentusername});
	client.save(function (err) {
	if (err) return handleError(err);
		logger.info('Client saved to db');
		});
	//console.log("Saving User");
	if(!dberror){
	User.findOne({ username: currentusername}, function(err, result){
	if(!err){
	logger.debug(result);
	logger.debug("JSON String: " + JSON.stringify(result));
	if(result == "" || result == undefined){
	logger.info("No Database user with username " + currentusername + " found");
	var usersockets = new Array();
	usersockets.push(socket.id);
	localuser = new User({username: currentusername, session_id: socket.handshake.sessionID, active_sockets: usersockets});
	localuser.save(function (err) {
	if (err) return handleError(err);
		logger.info('User saved to db');
		});
	}
	else{
	result.active_sockets.push(socket.id);
	result.save();
	//User.update({username: currentusername}, result[0], {upsert=true}, function(err){console.log(err);});
	}
	
	
	}
	else{
	logger.info("Error Querying User in DB");
	}
	});
	}
	
	getAlarms(currentusername, socket);
	socket.emit('socket-id', {socketid: socket.id});
	socket.emit('session-id', {sessionid: socket.handshake.sessionID});
	
  
  socket.on('disconnect', function() {
	
	logger.info('user ' + currentusername + ' disconnected socket ' + socket.id);
	delete sockets[socket.id];
	//sockets = arrayFunction("delete-property", sockets, socket.id, "id");
	if(!dberror){
	User.findOne({username: currentusername}, function(err,obj){
	if(!err){
	logger.debug(obj);
	var socketindex = obj.active_sockets.indexOf(socket.id);
	obj.active_sockets.splice(socketindex, 1);
	obj.save();
	}
	else{logger.info("error looking up user to delete sockets");}
	});
	Client.find({socket: socket.id}).remove();
	}
	else{
	logger.info('DB Error detected at socket delete');
	}
	if(!dberror){
	Client.find({id: client.id}).remove();
	}
	else{
	logger.info("Cannot connect to DB to delete client");
	}
  });
  


socket.on('add-alarm', function(data){
logger.info('adding alarm with date: ' + data.datetime);
var alarm = new Alarm(data);
alarm.save();
socket.emit('active-alarm-event', alarm);
socket.emit('update-add-alarms', alarm);
logger.info('sending add alarms event');
sendDataToUser(alarm.username, 'update-add-alarms', alarm);
});

socket.on('remove-alarm', function(data){
var alarm = new Alarm(data);
logger.info('Removing alarm with id ' + alarm._id);
Alarm.find({_id: alarm._id}).remove();
logger.info('sending remove alarm event');
sendDataToUser(alarm.username, 'update-remove-alarm', alarm);
});

socket.on('silence-alarm', function(data){
logger.info('silencing alarm for ' + data.username);
User.findOne({username: data.username}, function(err, obj){
if(err){console.log(err); return;}
for(var i=0; i<obj.active_sockets.length; i++){
var currsocketid = obj.active_sockets[i];
logger.info('silencing socket id ' + currsocketid);
currentsocket = sockets[currsocketid];
currentsocket.emit('silence-alarm', {silencedate: new Date(), username: data.username, alarm: data});
}
});
//logger.info('Removing Alarm with Id ' + data._id);
//Alarm.find({_id: data._id}).remove();
});

socket.on('list-alarms', function(data){
Alarm.find().exec(function(err,obj){
if(err){console.log(err); return}
logger.info(obj);
});
});
  
  
});
