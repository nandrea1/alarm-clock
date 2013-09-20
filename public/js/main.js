var houroffset = 12;
var socketid = "";
var username = "";
var sessionid = "";
var activealarm = {};
var alarmcount = 0;
  

function getAudio(audiofile){
	var htmlstring = '<audio autoplay><source type="audio/mpeg" src="' + audiofile + '" ></audio>';
$('#audiospace').html(htmlstring);
}

function customEvent(eventname, data){
socket.emit(eventname, data);
}

function formatTime(date){
var hours = (date.getHours() > 12) ? date.getHours()-12 : date.getHours();
var mins = date.getMinutes <10 ? "0" + date.getMinutes() : date.getMinutes();
var ampm = date.getHours() >= 12 ? "PM" : "AM";

var timestring = hours + ":" + mins +" " + ampm;

return timestring;

}

function initializeAlarms(alarms){
$('document').ready(function(){
$('#alarm-indicator').show();
activealarm = new Alarm(alarms[0]);
$('#alarm-button').text("Unset Alarm");
var alarmdate = new Date(activealarm.get('datetime'));
var timestring = formatTime(alarmdate);
$('#alarm-indicator').tooltip({title: timestring});
});
}


function snoozeAlarm(){
socket.emit('remove-alarm', activealarm);
console.log('Alarm Snoozed');
var snoozetime = activealarm.get("snooze_time");
console.log("snooze time is: " + snoozetime);
console.log('old time is: ' + activealarm.get("datetime"));
var  newdate = new Date(activealarm.get("datetime").getTime() + 1*activealarm.get("snooze_time"));
console.log('calc date is: ' + newdate);
activealarm.set("datetime", newdate);
console.log('new time is: ' + activealarm.get('datetime'));
socket.emit('add-alarm', activealarm);
}

function setAlarm(){
var alarmaction = $('#alarm-button').text();
var dt = new Date();
var dtstring = getDateString(dt);
var alarmtime = $('#timepicker').val();
var alarmdatestring = dtstring + " " + alarmtime;
console.log('alarm datetime: ' + alarmdatestring);
var adate = new Date(alarmdatestring);
var newday = dt.getDate();
if(dt > adate){
newday = dt.getDate()*1 + 1;
}
adate.setDate(newday);
console.log('alarm date is: ' + adate);
if(alarmaction == "Set Alarm"){
var alarm = new Alarm
if(username == "" || username == undefined){
username = sessionid;
}
alarm.set('username', username);
alarm.set('datetime', adate);
alarm.set('alarm_type', 'basicAlarm');
alarm.set('set', true);
activealarm = alarm;
$('#alarm-indicator').show();
$('#alarm-button').text("Unset Alarm");
var alarmdate = new Date(activealarm.get('datetime'));
var timestring = formatTime(alarmdate);
$('#alarm-indicator').tooltip({title: timestring});
}
else{
//actalarm = new Alarm(activealarm);
activealarm.set("set", false);
//activealarm = {};
$('#alarm-indicator').tooltip('destroy');
$('#alarm-indicator').hide();
$('#alarm-button').text("Set Alarm");
}
//$('#alarm-button').attr('onclick', unsetAlarm);
}

function unsetAlarm(){

//$('#alarm-button').attr('onclick', setAlarm);
}

function getDateString(dt){
var dateday = dt.getDate();
var datemonth = dt.getMonth()*1 + 1;
var dateyear = dt.getFullYear();
var dtstring = datemonth + "/" + dateday + "/" + dateyear;
return dtstring; 
}

function emitSilenceEvent(){
socket.emit('silence-alarm', activealarm);
}

function silenceAlarm(alarm){
alarm = new Alarm(alarm);
var musicareastring = alarm.get("music_area");
$(musicareastring).attr("src", "");
//var newdateday = new Date(alarm.get("datetime")).getDate()*1 + 1;
var newdateday = new Date().getDate()+1;
console.log('new date day: ' + newdateday);
var newdate = new Date().setDate(newdateday);
console.log('new date is: ' + newdate);
activealarm.set("datetime", newdate);
activealarm.set("set", true);
socket.emit('add-alarm', activealarm);
}

$(window).resize(function(){
var winheight = $(window).height();
var clockheight = $('#clock_container').height();
var topmargin = ((winheight/2) - (clockheight/2));
console.log('top margin is: ' + topmargin);
$('#clock_container').css('margin-top', topmargin+"px");
});

function setClock(){

var now = new Date();

var hours = (now.getHours() > 12) ? now.getHours() - houroffset*1 : now.getHours();
hours = (hours == 0) ? 12 : hours;
var ampm = (now.getHours() >= 12) ? " PM" : " AM";
var mins = (now.getMinutes() <10) ? "0" + now.getMinutes() : now.getMinutes();
var secs = (now.getSeconds() <10) ? "0" + now.getSeconds() : now.getSeconds();
$('#hours').text(hours+"");
$('.dot').text(":");
$('#minutes').text(mins+"");
$('#seconds').text(secs+"");
$('#ampm').text(ampm+"");
}