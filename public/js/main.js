var houroffset = 12;
var socketid = "";
var username = "";
var sessionid = "";
var host = "http://" + top.location.hostname;
var activealarm;
var pendingalarm;
var alarmcount = 0;
var music;
var host = top.location.protocol + top.location.host;

/***** Initialization Functions *****/

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

/***** ------------------ *****/

/**** Responsive Functions *****/

function setFontSize(){
    var perc = $(window).width()/1280; 
    var fontsize = perc*9; 
    var graysize = perc*15;
	var textsize = perc*1.5;
	textsize = (textsize >=1) ? textsize : 1;
    console.log('font size is: ' + fontsize); 
    $('.gray-text').css('font-size', graysize); 
    $('.clock_div').css('font-size', fontsize + "em");
	$('.info-text').css('font-size', textsize + "em");

}

$(window).resize(function(){
var winheight = $(window).height();
var clockheight = $('#clock_container').height();
var topmargin = ((winheight/2) - (clockheight/2));
console.log('top margin is: ' + topmargin);
$('#clock_container').css('margin-top', topmargin+"px");
setFontSize();
});

/****** ------------ ******/

/***** Screen Modification Functions ******/


function populateDropdownText(item){
var newtext = $(item).text();
var newval = $(item).attr('value');
console.log(newtext);
var currenttext = $('#alarmdropdown').text();
var currval = $('#alarmdropdown').attr('value');
console.log(currenttext);
$(item).html(currenttext);
$(item).attr('value', currval);
$('#alarmdropdown').html(newtext+'<b class="caret"></b>');
$('#alarmdropdown').attr('value', newval);
showAlarmSettings();
saveAlarmType();
}


function hideSeconds(){
$('#secondsdot').hide();
$('#seconds').hide();
visvar = 0;
}

function showSeconds(){
$('#secondsdot').show();
$('#seconds').show();
}

function toggleSettings(){
$('#settings-container').slideToggle({complete: function(){
var disp = $('#settings-container').css('display');
if(disp == "block" && (pendingalarm == {} || pendingalarm == undefined)){
console.log('Creating new Alarm');
pendingalarm = new Alarm;
}
initializePendingAlarm();
}
});

}

function showAlarmSettings(){
var selectedalarm = $('#alarmdropdown').text();
if(selectedalarm == "Grooveshark Alarm"){
$('#groovesharkrow').show();
}
else{
$('#groovesharkrow').hide();
}
}

function toggleSeconds(){
	if (visvar == 1) {
		hideSeconds();
	}
	else{
		showSeconds();
	}
}

function toggleTime(){
if(houroffset == 12){
	houroffset = 0;
	$('#ampm').hide();
}
else{
	houroffset = 12;
	$('#ampm').show();
}
}

function updateScreenAlarm(command){
if(command == "Set"){
$('#alarm-indicator').show();
$('#alarm-button').text("Unset Alarm");
var alarmdate = new Date(activealarm.get('datetime'));
var timestring = formatTime(alarmdate);
$('#alarm-indicator').tooltip({title: timestring});
}
if(command == "Unset"){
$('#alarm-indicator').tooltip('destroy');
$('#alarm-indicator').hide();
$('#alarm-button').text("Set Alarm");
}
}

/***** ---------- *****/

/***** Miscellaneous Functions *****/

function validateForm(id){
var inputs = $(id + " :input:not(button)");
var checkvar = true;
for(var i=0; i<inputs.length; i++){
var input = inputs[i];
var val = $(input).val();
if(val == "" || val == "undefined"){
checkvar = false;
}
}
if(checkvar){
$(id + " button").removeAttr('disabled');
}
else{
$(id + " button").attr('disabled', 'disabled');
}
}

function formatTime(date){
var hours = (date.getHours() > 12) ? date.getHours()-12 : date.getHours();
var mins = date.getMinutes <10 ? "0" + date.getMinutes() : date.getMinutes();
var ampm = date.getHours() >= 12 ? "PM" : "AM";

var timestring = hours + ":" + mins +" " + ampm;

return timestring;

}

function getDateString(dt){
var dateday = dt.getDate();
var datemonth = dt.getMonth()*1 + 1;
var dateyear = dt.getFullYear();
var dtstring = datemonth + "/" + dateday + "/" + dateyear;
return dtstring; 
}

function getAlarmDate(){
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
return adate;
}

function getUsername(){
if(username == "" || username == undefined){
username = sessionid;
}
return username;
}

function initializePendingAlarm(){
var adt = getAlarmDate();
var usr = getUsername();
pendingalarm.set('username', usr);
pendingalarm.set('datetime', adt);
var atype = $('#alarmdropdown').attr('value');
pendingalarm.set('alarm_type', atype);
}
/***** ------------------ *****/

/***** Interaction Driven Functions *****/


function setButtonClick(){
$('#alarm-button').click(function(){
console.log('clicked alarm button');
var alarmaction = $('#alarm-button').text();
if (alarmaction == "Set Alarm"){
setPendingAlarm();
updateScreenAlarm("Set");
}
else{
unsetPendingAlarm();
updateScreenAlarm("Unset");
}



});
}

//Driven by clicking on dropdown//

function saveAlarmType(){
var atype = $('#alarmdropdown').attr('value');
pendingalarm.set('alarm_type', atype);
}

// Driven by clicking silence in modal window //


function emitSilenceEvent(){
console.log('Alarm id is: ' + activealarm.get('_id'));
activealarm.set('is_set' , false);
socket.emit('silence-alarm', activealarm);
}

// Driven by clicking the Log In Text //

function loginModal(){
$('#login-button').click(function(){
var uname = $('#username').val();
var pword = $('#password').val();
console.log ('Logging in with Username: ' + uname + " and password " + pword);
});
$('#login-modal').modal('show');
}

/***** ------------------------- *****/

/***** Alarm Functions *****/

function setPendingAlarm(){
var adt = getAlarmDate();
pendingalarm.set('datetime', adt);
activealarm = undefined;
activealarm = pendingalarm.clone();
activealarm.set('is_set', true);
//pendingalarm = undefined;
}

function unsetPendingAlarm(){
activealarm.set("is_set", false);
activealarm = undefined;
}

function snoozeAlarm(){
//socket.emit('remove-alarm', activealarm);
activealarm.set('is_set', false);
music.pause();
music.currentTime = 0;
music = undefined;
console.log('Alarm Snoozed');
var snoozetime = activealarm.get("snooze_time");
console.log("snooze time is: " + snoozetime);
console.log('old time is: ' + activealarm.get("datetime"));
var  newdate = new Date(new Date(activealarm.get("datetime")).getTime() + 1*activealarm.get("snooze_time"));
console.log('calc date is: ' + newdate);
activealarm.set("datetime", newdate);
console.log('new time is: ' + activealarm.get('datetime'));
activealarm.set('is_set', true);
}

function silenceAlarm(alarm){
alarm._id = undefined;
alarm = new Alarm(alarm);
var musicareastring = alarm.get("music_area");
$(musicareastring).attr("src", "");
$(musicareastring).html("");
music.pause();
music.currentTime = 0;
music = undefined;
var newdateday = new Date().getDate()+1;
//console.log('new date day: ' + newdateday);
var newdate = new Date().setDate(newdateday);
//console.log('new date is: ' + newdate);
activealarm.set("datetime", newdate);
activealarm.set("is_set", true);
//socket.emit('add-alarm', activealarm);
}

/***** --------- *****/


function getAudio(audiofile){
	var htmlstring = '<audio autoplay><source type="audio/mpeg" src="' + audiofile + '" ></audio>';
$('#audiospace').html(htmlstring);
}

function customEvent(eventname, data){
socket.emit(eventname, data);
}


function getSong(){
var searchstring = $('#groovesharksearch').val();
var searchurl = groovesharkroot + searchstring + '?format=json&key=' + groovesharkkey+'&callback=?';
console.log('grooveshark key: ' + searchurl);
$.getJSON(searchurl, function(data){console.log(data);});
}


function getSongAjax(){
var searchstring = $('#groovesharksearch').val();
//var searchurl = host +'/searchSong/' + searchstring;
var searchurl = '/searchSong/' + searchstring;
console.log('grooveshark key: ' + searchurl);
$.ajax({
    url : searchurl,
    type : 'get',
    //dataType : 'jsonp',
    success : function(response){
        console.log(response);
        
    },
    error: function(error){
        console.warn('ERROR');
        console.warn(error);
    }

});

}












