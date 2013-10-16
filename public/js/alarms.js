var Alarm = Backbone.Model.extend( {

initialize: function(){

            this.on("change:is_set", function(model){
				if(model.get("is_set")){
                socket.emit('add-alarm', model);
				
				
				}
				else if(!model.get("is_set")){
				socket.emit('remove-alarm', model);
				
				}
            });},
defaults: {
"username": "",
"is_set": false,
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

},

setAlarm: function(){
this.is_set = true;
},

unsetAlarm: function(){
	this.is_set = false;
},

setAlarmType: function(type){
this.alarm_type = type;
},

create: function(){return this;}

});