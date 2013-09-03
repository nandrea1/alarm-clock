Alarm =  {

set: false,
time: "",
date: "",
checkAlarm: function (date, time){
dats = new Date(date + " " + time);
now = new Date();
if (now > dats){
return true;
}
else{
return false;
}

},
alarmType: "basicAlarm",
inter: "",
alarmsong: "",
setAlarm: function(){
this.set = true;
this.inter = setInterval(function(){
var check = Alarm.checkAlarm(Alarm.time, Alarm.date);
if(check){
	var atype = Alarm.alarmType;
	Alarm[atype]();
}
},10000);

},
unsetAlarm: function(){
	this.set = false;
	window.clearInterval(this.inter);
},

setAlarmType: function(type){
this.alarmType = type;
},

fulldate: "",

musicAlarm: function(){
var alarmstring = "/files/"+this.alarmsong;
getAudio(alarmstring);
/*var alarmon = confirm('Alarm Activated');
if(alarmon){
	$('#audiospace').html("");
	window.clearInterval(inter);
}*/
},

setDate: function(){fulldate = new Date(date + " " + time);},

basicAlarm: function(){
var confirmstring = "Snooze Alarm?";
if(snoozecount > 0) {
if(snoozecount == 1) {
confirmstring = confirmstring + "\r\n You've already Snoozed Once FYI";
}
if(snoozecount >1 && snoozecount <5){
confirmstring += "\r\n You've Snoozed " + snoozecount + " times already FYI";
}
if(snoozecount > 5){
confirmstring += "\r\n Get Up Already, You've Snoozed more than 5 times";
}
}
var alarmaction = confirm(confirmstring);
if(alarmaction){
snoozecount++;
snoozetime = $('#snoozetime').val();
if (snoozetime == undefined || snoozetime == ""){
snoozetime = 1;
}
snoozetime = snoozetime * 1;
dt = new Date(alarmdate + " " + alarmtime);
console.log('snoozetime is: ' + snoozetime);
dt.setMinutes(dt.getMinutes()+snoozetime);
newhrs = (dt.getHours() > 12) ? dt.getHours()-12 : dt.getHours();
newmins = (dt.getMinutes()<10) ? "0"+dt.getMinutes() : dt.getMinutes();
newampm = (dt.getHours() > 12) ? 'PM' : 'AM';
newalarmtime = newhrs + ":" + newmins +" " + newampm;
alarmtime = newalarmtime;
console.log('New Alarm Time is: ' + alarmtime);
}
else{
console.log('No Snooze');
setdate= new Date();
setdate.setDate(new Date().getDate() + 1);
alarmdate = setdate.getMonth()+1 +"/" + setdate.getDate() + "/" + setdate.getFullYear();
console.log('New Alarm Date is: ' + alarmdate);
snoozecount = 0;
}
}

}