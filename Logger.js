var Logger = function(loglevel){

this.loglevel = loglevel;

this.debug = debugLog;
this.info = infoLog;
this.trace = traceLog;

function infoLog(message){
if(this.loglevel == 'info'){
console.log(message);
}
}

function traceLog(message){
if(this.loglevel == 'trace'){
console.log(message);
}
}

function debugLog(message){
if(this.loglevel == 'debug'){
console.log(message);
}
}



}

exports.Logger = Logger;