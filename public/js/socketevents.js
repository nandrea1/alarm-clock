var socket = io.connect(host);
  
socket.on('connect', function() {
console.log("Connected to Server");

});
  
socket.on('socket-id', function(data){
console.log('recieving socket id');
socketid = data.socketid;
});

socket.on('session-id', function(data){
console.log('recieving session id');
sessionid = data.sessionid;
});

socket.on('silence-alarm', function(data){
var alarm = new Alarm(data.alarm)
console.log('alarm silenced by ' + alarm.get('username')  + ' on ' + data.silencedate);
console.log('alarm id recieved from server to silence: ' + alarm.get('_id'));
$('#alarmmodal').modal('hide');
silenceAlarm(alarm);
});

socket.on('send-alarms', function(data){
var alarms = data.alarms;
console.log(alarms.length + ' alarm(s) recieved from server');
if(alarms.length >0){
console.log('initializing alarms');
initializeAlarms(alarms);
}
});

socket.on('update-add-alarms', function(data){
console.log('Recieving Update Alarms Event');
alarm = new Alarm(data);
activealarm = alarm;
$('#alarm-indicator').show();
$('#alarm-button').text("Unset Alarm");
var alarmdate = new Date(activealarm.get('datetime'));
var timestring = formatTime(alarmdate);
$('#alarm-indicator').tooltip({title: timestring});
});

socket.on('update-remove-alarm', function(data){
console.log('Recieving Remove Alarms Event');
activealarm = undefined;
$('#alarm-button').text("Set Alarm");
$('#alarm-indicator').tooltip('destroy');
$('#alarm-indicator').hide();
});

socket.on('alarm-event', function(data){
console.log('alarm event recieved');
//console.log(data);
var alarm = new Alarm(data);
var alarmtype = alarm.get("alarm_type");
var alarmid = alarm.get("_id");
console.log('Alarm Id is: ' + alarmid);
activealarm = alarm;
alarm[alarmtype]();
});