
window.onload = function() {
/*
--------------------------------------------------------------------------------
 JSON Playlist
--------------------------------------------------------------------------------
*/ 
$jsonPlayList = [{
"0":{"title ":"Southern Nights","source":"audio/Southern Nights.mp3","type":"audio/mp3","album":"Southern Nights","artist":"Glen Campbell","poster":"audio/images/campbell.jpg"},
"1":{"title ":"A Fifth of Beethoven","source":"audio/A Fifth of Beethoven.mp3","type":"audio/mp3","album":"Saturday Night Fever Soundtrack","artist":"Walter Murphy","poster":"audio/images/snf.jpg"},
"2":{"title ":"Ain't No Sunshine","source":"audio/Aint No Sunshine.mp3","type":"audio/mp3","album":"Just as I Am","artist":"Bill Withers","poster":"audio/images/withers.jpg"},
"3":{"title ":"Tempted","source":"audio/Tempted.mp3","type":"audio/mp3","album":"East Side Story","artist":"Squeeze","poster":"audio/images/squeeze.jpg"},
"4":{"title ":"Raspberry Beret","source":"audio/Raspberry Beret.mp3","type":"audio/mp3","album":"Around the World in a Day","artist":"Prince, The Revolution","poster":"audio/images/prince.jpg"},
"5":{"title ":"ABC","source":"audio/abc.mp3","type":"audio/mp3","album":"ABC","artist":"The Jackson Five","poster":"audio/images/jackson5.jpg"}
}];

/*
--------------------------------------------------------------------------------
 Language / Translation
--------------------------------------------------------------------------------
*/ 
  var lang = {
    album        :    "Album:",
    artist       :    "Artist:",
    audioel      :    "Audio Element",
    audionf      :    "Audio Element Not Found.",
    belmissing   :    "Button Element Not Found",
    button       :    "Button",
    click        :    "Click",
    clicked      :    "Clicked",
    duration     :    "Duration:",
    error        :    "Error!",
    event        :    "Event:",
    missing      :    "Missing",
    notfound     :    "Not Found",
    pause        :    "Pause",
    pauseclicked :    "Pause Clicked.",
    paused       :    "Audio Paused.",
    play         :    "Play",
    playclicked  :    "Play Clicked.",
    playended    :    "Playback Ended.",
    playlist     :    "Playlist",
    playlistnf   :    "Playlist Not Found",
    poster       :    "Poster",
    seekcomplete :    "Seek Complete.",
    seekstarted  :    "Seek Started.",
    stop         :    "Stop",
    stopclicked  :    "Stop Clicked.",
    time         :    "Time:",
    title        :    "Title:",
    track        :    "Track",
    tracks       :    "Tracks",
    mimetype     :    "MIME Type:",
    ready        :    "Ready",
    reset        :    "Reset Initiated.",
    source       :    "Source:",
    volume       :    "Volume:"
  }
  // logs errors, events, and stats to console?
  var errorlog = 1, eventlog = 1, statslog = 1;
/*
--------------------------------------------------------------------------------
  
  ** Please do not edit below this line unless you know what you are doing **

--------------------------------------------------------------------------------
  DOM Element Constants
--------------------------------------------------------------------------------
*/
var playList           = document.getElementsByTagName('audio');
var playlistPanel      = document.getElementById("playlist_panel");
var panelElement       = document.getElementById("panel_button");
var playElement        = document.getElementById('play');
var nextElement        = document.getElementById('next');
var prevElement        = document.getElementById('previous');
var pauseElement       = document.getElementById('pause');
var stopElement        = document.getElementById('stop');
var audioLeft          = document.getElementById("audio_time_left");
var audioProgress      = document.getElementById("audio_progress");
var audioElapsed       = document.getElementById("audio_time_elapsed");
var posterwrap         = document.querySelector('.posterwrap');
var audioplayer        = document.getElementById("audioplayer");
/*
--------------------------------------------------------------------------------
  Canvas Related Constants
--------------------------------------------------------------------------------
*/ 
var canvaswrapper      = document.querySelector('.canvaswrapper');
var canvas             = document.querySelector('.visualizer');
var canvas2            = document.querySelector('.visualizer2');
var canvasCtx          = canvas.getContext("2d");
var canvasCtx2         = canvas2.getContext("2d");
var intendedWidth      = canvaswrapper.clientWidth;
var intendedHeight     = canvaswrapper.clientHeight / 2;
var canvasWidth        = intendedWidth;
var canvasHeight       = intendedHeight;

canvaswrapper.style.opacity = 0;
canvas.setAttribute('width',intendedWidth);
canvas2.setAttribute('width',intendedWidth);
/*
--------------------------------------------------------------------------------
  Define Some Arrays and Declare Some Globals
--------------------------------------------------------------------------------
*/ 
var trackSum = playList.length;

var audioElement = playList[0];

var startSeekTime     = '0',
		currentTrackCount = '0',
		trackProgress     = '0', 
		trackCount        = '0',
		cnt               = '0',
		visualizing       = '0';

var title = {}, source = {}, poster  = {}, artist   = {}, isPlaying = {},
		album = {}, type   = {}, runOnce = {}, isLoaded = {}, listeners = {};
/*
--------------------------------------------------------------------------------
  setup audio connections for visualizer
--------------------------------------------------------------------------------
*/ 
navigator.getUserMedia = ( navigator.getUserMedia        || 
													 navigator.webkitGetUserMedia  ||
													 navigator.mozGetUserMedia     ||
													 navigator.msGetUserMedia);

var audioCtx      = window.AudioContext || window.webkitAudioContext;

var audio         = new audioCtx();

var analyser      = audio.createAnalyser(); 
										analyser.minDecibels            = -90,
										analyser.maxDecibels            = 100,
										analyser.smoothingTimeConstant  = 0.85;

var distortion   = audio.createWaveShaper(),
		gainNode     = audio.createGain(),
		biquadFilter = audio.createBiquadFilter(),
		convolver    = audio.createConvolver();

var audioSource = {}, sourceAudio = {};

analyser.connect(audio.destination);
gainNode.connect(audio.destination);

getPlayList();
/*
--------------------------------------------------------------------------------
  get playlist
--------------------------------------------------------------------------------
*/ 
function getPlayList() {

  var Songs = {};

  trackSum < 2 ? lang['tracks'] = lang['track'] : null;

	console.log(lang['playlist']+' ('+trackSum+' '+lang['tracks']+')');
	
	for (var i = 0; i < playList.length; i++) {

		playList[i].currentTime = 0;

		var tracknum = i + 1;

		title[i]  = playList[i].getAttribute("title");
		source[i] = playList[i].getAttribute("src");
		type[i]   = playList[i].getAttribute("type");
		album[i]  = playList[i].getAttribute("album");
		artist[i] = playList[i].getAttribute("artist");      
		poster[i] = playList[i].getAttribute("poster");
	
		console.log('\n'+'-'.repeat(60));
		console.log(lang['track']+' '+tracknum);
		console.log('-'.repeat(60)+'\n');
		console.log(lang['title']+' '+title[i]);
		console.log(lang['source']+' '+source[i]);
		console.log(lang['mimetype']+' '+type[i]);
		console.log(lang['artist']+' '+artist[i]);
		console.log(lang['album']+' '+album[i]);
		console.log(lang['poster']+' '+poster[i]);
		
		Songs[i] = {
		  "title "  :  title[i],
		  "source"  :  source[i],
		  "type"    :  type[i],
		  "album"   :  album[i],
		  "artist"  :  artist[i],
		  "poster"  :  poster[i]
		};	
	}
	console.log('\n\n');

	audioElement      = playList[0];

	currentTrackCount = '0';
	trackCount        = '0';

	audioSource[0]    = audio.createMediaElementSource( audioElement );
	sourceAudio[0]    = 1;

	audioSource[0].connect( analyser );
	audioSource[0].connect( audio.destination );

	prevElement.classList.add("notavailable");
	nextElement.classList.add("notavailable");

  if (playList[1]) {
    nextElement.classList.remove("notavailable");  
  }

	getPoster();
	populateDivs();
	visualize();
	// JSON object songs contains the playlist
	//var json_str = JSON.stringify(Songs);
	//console.log(json_str);
	
}

//function setAttributes() {
  // updates our single audio element with attributes for this track
//  audioElement.setAttribute("title") = title[currentTrackCount];
//  audioElement.setAttribute("src")   = source[currentTrackCount];
//  audioElement.setAttribute("type")  = type[currentTrackCount];
//}

function showPlayList() {

	//for (var i = 0; i < playList.length; i++) {
	
    //alert( title[i] );
		
		//textList += title[i] + ;
//	}
}

/*
--------------------------------------------------------------------------------
  AJAX PlayList - not yet implemented
--------------------------------------------------------------------------------
*/
/*
function ajaxPlayList() {
	var httpRequest = new XMLHttpRequest;

	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === 4) {// request is done
			if (httpRequest.status === 200) {// successfully
				var filelist = httpRequest.responseText;
				console.log(filelist);// we're calling our method
			}
		}
	};
	httpRequest.open('GET', "scandir.php");
	httpRequest.send();

var playList = JSON.parse(httpRequest.responseText);
playList.employees[i].firstName + " " + obj.employees[1].lastName; 

}*/
/*
--------------------------------------------------------------------------------
  Error Log
--------------------------------------------------------------------------------
*/
function logError(msg) {

  errorlog ?

    console.log(lang['error']+': '+msg) : null;

}
/*
--------------------------------------------------------------------------------
  Event Log
--------------------------------------------------------------------------------
*/
function logEvent(msg,msgtime) {

  eventlog ?

	  console.log(lang['event']+' '+msg+' '+lang['time']+' '+msgtime) : null;
}
/*
--------------------------------------------------------------------------------
  populateDivs - fills our HTML elements with some content
-------------------------------------------------------------------------------- 
*/
function populateDivs() {

	var audioTitle           = document.getElementById("audio_title");

	var audioArtist          = document.getElementById("audio_artist");

	var audioAlbum           = document.getElementById("audio_album");

	var audioVolume          = document.getElementById("audio_volume");

	var audioMute            = document.getElementById("audio_mute");

	var audioDuration        = document.getElementById("audio_progress");

	var audioElapsed         = document.getElementById("audio_time_elapsed");

	var audioRemaining       = document.getElementById("audio_time_left");

	updateTime();

	audioTitle.innerHTML     = title[currentTrackCount];

	audioArtist.innerHTML    = artist[currentTrackCount];

	audioAlbum.innerHTML     = album[currentTrackCount];

	audioDuration.innerHTML  = "";

	audioMute.innerHTML      = "";
	
	if (poster[currentTrackCount]) { getPoster(currentTrackCount); }
}

/*function reqListener () { console.log(this.responseText); }
var oReq = new XMLHttpRequest();
oReq.onload = function() { alert(this.responseText); };
oReq.open("get", "scandir.php", true);
oReq.send();*/


//playlist.onclick = function(event) {
  //alert("clicked on panel");
//  panel.classList.add("display");
//  showPlayList();
//	event.preventDefault();
//}

/*
--------------------------------------------------------------------------------
  playElement - onclick
--------------------------------------------------------------------------------
*/
playElement.onclick = function(event) {
  playAudio();
	event.preventDefault();
}
/*
--------------------------------------------------------------------------------
  nextElement - onclick
--------------------------------------------------------------------------------
*/
nextElement.onclick = function(event) {
	stopAudio();
  currentTrackCount++;
  playList[currentTrackCount] ? true : currentTrackCount = '0';
  playAudio();
	event.preventDefault();
}
/*
--------------------------------------------------------------------------------
  prevElement - onclick
--------------------------------------------------------------------------------
*/
prevElement.onclick = function(event) {
	stopAudio();
  currentTrackCount--;
  playList[currentTrackCount] ? true : currentTrackCount = '0';
  playAudio();
	event.preventDefault();
}
/*
--------------------------------------------------------------------------------
  Play Audio - all play functions routed here
--------------------------------------------------------------------------------
 */
function playAudio() {

	console.log('track count is '+currentTrackCount);
  	
  var trackindex = currentTrackCount,
      nextTrack  = currentTrackCount,
      prevTrack  = currentTrackCount;
      
  startSeekTime = 0, nextTrack++, prevTrack--;

  playList[nextTrack] ? setClass('next','1') : setClass('next','0');
	playList[prevTrack] ? setClass('prev','1') : setClass('prev','0');

	audioElement = playList[currentTrackCount];

	populateDivs(), getPoster(), audioElement.load;

	if (audioElement.readyState === 4) {

		if (!sourceAudio[trackindex]) { addAudioSource(trackindex); }

		isLoaded[trackindex] = 1;

		console.log(lang['ready']); statsLog();

		if (!listeners[trackindex]) { addListeners(); }

		audioElement.play();
	}
	/*
	------------------------------------------------------------------------------
		Update CSS Class
	------------------------------------------------------------------------------
	*/
	function setClass(el,ebool) {
 
		el == 'next' ? el = nextElement : el = prevElement;
 
		if (ebool == 1) {
			el.classList.remove("notavailable"); el.classList.add("available"); 
		}
		else { 
		  el.classList.remove("available"); el.classList.add("notavailable");
		}
	}
	/*
	------------------------------------------------------------------------------
		Add Audio Source
	------------------------------------------------------------------------------
	*/
	function addAudioSource(trackNum) {
		audioSource[trackNum] = audio.createMediaElementSource( audioElement );
		audioSource[trackNum].connect( analyser );
		audioSource[trackNum].connect( audio.destination );
		sourceAudio[trackNum] = 1;
	}
	/*
	------------------------------------------------------------------------------
		Stats Log
	------------------------------------------------------------------------------
	*/
	function statsLog() {
		var thisduration = getTheTime(audioElement.duration);

		console.log(lang['title']    +' '+  audioElement.title); 
		console.log(lang['source']   +' '+  audioElement.src);
		console.log(lang['time']     +' '+  audioElement.currentTime);
		console.log(lang['volume']   +' '+  audioElement.volume);
		console.log(lang['duration'] +' '+  thisduration);
	}
	/*
	------------------------------------------------------------------------------
		Playback status listeners
	------------------------------------------------------------------------------
	*/
	function addListeners() {

		listeners[currentTrackCount] = 1; 

		console.log('Adding listeners for playing, ended, pause');
		
		audioElement.addEventListener("playing", function(event)  {

			isPlaying[currentTrackCount] = true;

			removePoster();

			trackProgress = window.setInterval(updateTime, 1000);

			event.preventDefault();

			console.log('Next up is '+ title[nextTrack]);

		});
		/*
		----------------------------------------------------------------------------
			'Ended' Event Listener - playback of current track has ended
		----------------------------------------------------------------------------
		*/
		audioElement.addEventListener("ended", function(event)  {

			if (trackProgress) { clearInterval(trackProgress); }

			console.log(lang['playended']);

			audioElement.pause();

			audioElement.currentTime = 0;

			populateDivs(nextTrack);

			currentTrackCount = nextTrack;

			playAudio();

			event.preventDefault();

		}); // end of ended listener

		console.log('Adding pause listener for'+' '+title[currentTrackCount]);
		/*
		----------------------------------------------------------------------------
			Pause Event Listener
		----------------------------------------------------------------------------
		*/
		audioElement.addEventListener("pause", function(event)  {

			logEvent(lang['paused'], audioElement.currentTime);

			getPoster();

			canvaswrapper.style.opacity = 0;

			startSeekTime = 0; // reset start seek time

			event.preventDefault();
		});

	} // end of listeners
   
}  // end of play
/*
--------------------------------------------------------------------------------
  Stop Audio
--------------------------------------------------------------------------------
*/
function stopAudio() {

	if (trackProgress) { clearInterval(trackProgress); }
	
	logEvent(lang['stopclicked'],audioElement.currentTime);

	audioElement.pause();

	audioElement.currentTime = 0;

	getPoster();
	
	isPlaying[currentTrackCount] = 0;

	isLoaded[currentTrackCount]  = 0;

	logEvent(lang['reset'],audioElement.currentTime);
}
/*
--------------------------------------------------------------------------------
  Get Poster
--------------------------------------------------------------------------------
*/
function getPoster() {
  var posterurl = 'url(' + poster[currentTrackCount] + ')';
  audioplayer.style.backgroundImage  = posterurl;
  audioplayer.style.backgroundRepeat = "no-repeat";
  posterwrap.style.opacity = 0; // hide our overlay
}
/*
--------------------------------------------------------------------------------
  Remove Poster
--------------------------------------------------------------------------------
*/
function removePoster() {
  posterwrap.style.opacity    = 1;  // show our overlay, which hides the poster
  canvaswrapper.style.opacity = 1;  // show our visualizations    
}
/*
--------------------------------------------------------------------------------
  Panel Button on Click Event
--------------------------------------------------------------------------------
*/
panelElement.onclick = function(event) {
  playlistPanel.classList.toggle("expand");
	event.preventDefault();
};
/*
--------------------------------------------------------------------------------
updateTime - watches seconds elapsed and duration to track progress
--------------------------------------------------------------------------------
*/  
function updateTime() {

	// elapsed

	var listenTime         = Math.floor(audioElement.currentTime);

	var secondsElapsed     = Math.floor(listenTime);

	var timeElapsed        = getTheTime(secondsElapsed);
	
	audioElapsed.innerHTML = timeElapsed;

	// time remaining

	if (audioElement.duration) {

		var timeDuration     = Math.floor(audioElement.duration);

		var secondsToGo      = Math.floor(timeDuration - listenTime);

		var timeLeft         = getTheTime(secondsToGo);

		audioLeft.innerHTML  = '-' + timeLeft;

		// percentage of progress / progress bar

		var progressPercent = Math.floor((listenTime / timeDuration) * 100);

		audioProgress.style.width = progressPercent + '%';
		
		/*
		if (progressPercent < 11) {
			 if      (progressPercent === 2)  { console.log("2 percent");  }
			 else if (progressPercent === 5)  { console.log("5 percent");  }
			 else if (progressPercent === 10) { console.log("10 percent"); }
		}
		if (secondsToGo < 31) {
			if      (secondsToGo === 30) {  console.log("30 secs left");   }
			else if (secondsToGo === 20) {  console.log("20 secs left");   }
			else if (secondsToGo === 10) {  console.log("10 secs left");   }
		}
		*/

	} // end of if duration
} // end of updateTime
/*
--------------------------------------------------------------------------------
  Get the Time - convert playback time and duration into progress
--------------------------------------------------------------------------------
*/
function getTheTime(secs) {

	var hours                = Math.floor(secs / (60 * 60));

	var divisor_for_minutes  = secs % (60 * 60);

	var minutes              = Math.floor(divisor_for_minutes / 60);

	var divisor_for_seconds  = divisor_for_minutes % 60;

	var seconds              = Math.ceil(divisor_for_seconds);

	hours < 10 ? hours       = '0' + hours   : false;

	minutes < 10 ? minutes   = '0' + minutes : false;

	seconds < 10 ? seconds   = '0' + seconds : false;

	var hourstime  = hours+':'+minutes+':'+seconds;

	var minstime   = minutes+':'+seconds;
	
	var result;

	hours > 0 ? result = hourstime : result = minstime;

	return result;
}
/*
--------------------------------------------------------------------------------
  pauseElement - pause button onclick event
--------------------------------------------------------------------------------
*/
pauseElement ?

	pauseElement.onclick = function(event) {

		audioElement.pause(), event.preventDefault();
	
		logEvent(lang['pauseclicked'], audioElement.currentTime);

	}

	: logError(lang['pause']+' '+lang['belmissing']);
/*
--------------------------------------------------------------------------------
  stop button onclick event
--------------------------------------------------------------------------------
*/
stopElement ?

	stopElement.onclick = function(event) {

		stopAudio(), event.preventDefault();

		if (trackProgress) { clearInterval(trackProgress); }

	}

	: logError(lang['stop']+' '+lang['belmissing']);
/*
--------------------------------------------------------------------------------
 visualize - our canvas drawing operations
--------------------------------------------------------------------------------
*/
function visualize() {

	analyser.fftSize = 2048;
	var bufferLength = analyser.frequencyBinCount;
	var dataArray    = new Uint8Array(bufferLength);

	canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
	canvasCtx2.clearRect(0, 0, canvasWidth, canvasHeight);

	function draw() {

    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
		canvasCtx2.clearRect(0, 0, canvasWidth, canvasHeight);

		var drawVisual = requestAnimationFrame(draw), 
		    barWidth = 1, barHeight, x = 0;

		analyser.getByteFrequencyData(dataArray);

		for (var i = 48; i < bufferLength; i++) { barHeight = dataArray[i];

			// base RGB
			var  red   = 105,    red2 = 112,
			     green = 220,  green2 = 188,
			     blue  = 255,  blue2  = 255;

			// frequency affects RGB fill color
			//red   += barHeight,  red2    += barHeight,
			//green -= barHeight,  green2 -= barHeight,
			//blue  -= barHeight,  blue2  -= barHeight;

			canvasCtx.fillStyle  = 'rgb('+red+','+green+','+blue+')';
			canvasCtx2.fillStyle = 'rgb('+red2+','+green2+','+blue2+')';

			canvasCtx.fillRect ( x, canvasHeight-barHeight, barWidth, barHeight );
      canvasCtx2.fillRect( x, canvasHeight-barHeight, barWidth, barHeight );
    
			x += barWidth + 0;
			
		}

	}; // end of draw

	draw();

} // end of visualize

};
