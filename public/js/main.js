

function getAudio(audiofile){
	var htmlstring = '<audio autoplay><source type="audio/mpeg" src="' + audiofile + '" ></audio>';
$('#audiospace').html(htmlstring);
}