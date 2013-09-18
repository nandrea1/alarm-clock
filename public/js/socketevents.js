var socket = io.connect('http://localhost');
  
socket.on('connect', function() {
console.log("Connected to Server");
});
  
socket.on('socket-id', function(data){
socketid = data.socketid;
});

socket.on('session-id', function(data){
sessionid = data.sessionid;
});

socket.on('silence-alarm', function(data){
var alarm = new Alarm(data.alarm)
console.log('alarm silenced by ' + alarm.get('username')  + ' on ' + data.silencedate);
silenceAlarm(alarm);
});

socket.on('alarm-event', function(data){
console.log('alarm event recieved');
console.log(data);
var alarm = new Alarm(data);
var alarmtype = alarm.get("alarm_type");
alarm[alarmtype]();
});