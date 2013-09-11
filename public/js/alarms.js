Alarm =  {

username: "",
set: false,
time: "",
date: "",
datetime: "",
pandora_station: "",
grooveshark_song: "",
radio_station: "",
snooze_time: "",
complexity: "",
email_notify:"",
notify_addresses: [],
snooze_limit: "",
gradual_volume: false,
alarm_type: "",

checkAlarm: function (){
dats = new Date(this.datetime);
now = new Date();
if (now > dats){
return true;
}
else{
return false;
}

},

setAlarm: function(){
this.set = true;
},

unsetAlarm: function(){
	this.set = false;
},

setAlarmType: function(type){
this.alarm_type = type;
}


}