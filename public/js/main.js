var houroffset = 12;

function getAudio(audiofile){
	var htmlstring = '<audio autoplay><source type="audio/mpeg" src="' + audiofile + '" ></audio>';
$('#audiospace').html(htmlstring);
}

$(window).resize(function(){
var winheight = $(window).height();
$('#clock_container').css('margin-top', ((winheight/2)-40)+"px");
});

function setClock(){

var now = new Date();

var hours = (now.getHours() > 12) ? now.getHours() - houroffset*1 : now.getHours();
hours = (hours == 0) ? 12 : hours;
var ampm = (now.getHours() >= 12) ? " PM" : " AM";
var mins = (now.getMinutes() <10) ? "0" + now.getMinutes() : now.getMinutes();
var secs = (now.getSeconds() <10) ? "0" + now.getSeconds() : now.getSeconds();
$('#hours').html(hours+"");
$('.dot').html(":");
$('#minutes').html(mins+"");
$('#seconds').html(secs+"");
$('#ampm').html(ampm+"");
}