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

socket.on('alarm-event', function(data){
console.log('alarm event recieved');
console.log(data);
});