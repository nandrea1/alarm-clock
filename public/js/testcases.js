function testAlarm(date){
var alarm = new Alarm;
alarm.set("alarm_type", "groovesharkAlarm");
alarm.set("username", sessionid);
alarm.set("datetime", new Date(date));
alarm.set("grooveshark_link", "http:\/\/tinysong.com\/1dpSY");
alarm.set("music_area", "#musicarea");

alarm.set("set", true);
return alarm;
}