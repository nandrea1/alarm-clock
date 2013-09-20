var Alarm = Backbone.Model.extend( {

initialize: function(){

            this.on("change:set", function(model){
				if(model.get("set")){
                socket.emit('add-alarm', model);
				
				
				}
				else if(!model.get("set")){
				socket.emit('remove-alarm', model);
				
				}
            });},
defaults: {
"username": "",
"set": false,
"time": "",
"date": "",
"datetime": "",
"pandora_station": "",
"grooveshark_link": "",
"grooveshark_song": "",
"radio_station": "",
"snooze_time": 120000,
"complexity": "",
"email_notify":"",
"notify_addresses": [],
"snooze_limit": 5,
"gradual_volume": false,
"alarm_type": "",
"music_area": "",
},
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

groovesharkAlarm: function(){
//$(this.get('music_area')).html("<audio autoplay> <source src='" + this.get("grooveshark_link") +  "' ></source></audio");
try{
$(this.get('music_area')).attr("src", this.get("grooveshark_link"));
}
catch (e){
console.log("error");
}
},

basicAlarm: function() {

$('#alarmmodal').modal({remote: '/files/alarmwindowbody.html', keyboard:false});

/*
var alarmoff = confirm('Alarm Activated! Click Ok to silence, Cancel to Snooze');
if(alarmoff){
socket.emit('silence-alarm', this);
this.unsetAlarm();
}
else{
socket.emit('remove-alarm', this);
console.log('Alarm Snoozed');
var snoozetime = this.get("snooze_time");
console.log("snooze time is: " + snoozetime);
console.log('old time is: ' + this.get("datetime"));
var  newdate = new Date(new Date().getTime()*1 + 1*this.get("snooze_time"));
console.log('calc date is: ' + newdate);
this.set("datetime", newdate);
console.log('new time is: ' + this.datetime);
socket.emit('add-alarm', this);
}*/
},

setAlarm: function(){
this.set = true;
},

unsetAlarm: function(){
	this.set = false;
},

setAlarmType: function(type){
this.alarm_type = type;
},

create: function(){return this;}

});