window.onload = function() {
  var lang = {
      album:        "Album:",
      artist:       "Artist:",
      audioel:      "Audio Element",
      audionf:      "Audio Element Not Found.",
      belmissing:   "Button Element Not Found",
      button:       "Button",
      click:        "Click",
      clicked:      "Clicked",
      duration:     "Duration:",
      error:        "Error!",
      event:        "Event:",
      missing:      "Missing",
      notfound:     "Not Found",
      pause:        "Pause",
      pauseclicked: "Pause Clicked.",
      paused:       "Audio Paused.",
      play:         "Play",
      playclicked:  "Play Clicked.",
      playended:    "Playback Ended.",
      playlist:     "Playlist",
      playlistnf:   "Playlist Not Found",
      poster:       "Poster",
      seekcomplete: "Seek Complete.",
      seekstarted:  "Seek Started.",
      stop:         "Stop",
      stopclicked:  "Stop Clicked.",
      time:         "Time:",
      title:        "Title:",
      track:        "Track",
      tracks:       "Tracks",
      mimetype:     "MIME Type:",
      ready:        "Ready",
      reset:        "Reset Initiated.",
      source:       "Source:",
      volume:       "Volume:"
    }
  var errorlog = 1, eventlog = 1, statslog = 1;
  var playList        = document.getElementsByTagName('audio');
  var playlistPanel   = document.getElementById("playlist_panel");
  var panelElement    = document.getElementById("panel_button");
  var playElement     = document.getElementById('play');
  var nextElement     = document.getElementById('next');
  var prevElement     = document.getElementById('previous');
  var pauseElement    = document.getElementById('pause');
  var stopElement     = document.getElementById('stop');
  var audioLeft       = document.getElementById("audio_time_left");
  var audioProgress   = document.getElementById("audio_progress");
  var audioElapsed    = document.getElementById("audio_time_elapsed");
  var posterwrap      = document.querySelector('.posterwrap');
  var audioplayer     = document.getElementById("audioplayer");
  var canvaswrapper   = document.querySelector('.canvaswrapper');
  var canvas          = document.querySelector('.visualizer');
  var canvas2         = document.querySelector('.visualizer2');
  var canvasCtx       = canvas.getContext("2d");
  var canvasCtx2      = canvas2.getContext("2d");
  var intendedWidth   = canvaswrapper.clientWidth;
  var intendedHeight  = canvaswrapper.clientHeight / 2;
  var canvasWidth     = intendedWidth;
  var canvasHeight    = intendedHeight;

  canvaswrapper.style.opacity = 0;
  canvas.setAttribute('width', intendedWidth);
  canvas2.setAttribute('width', intendedWidth);
  
  var trackSum          = playList.length;
  var audioElement      = playList[0];
  var startSeekTime     = '0';
  var currentTrackCount = '0';
  var trackProgress     = '0';
  var trackCount        = '0';
  var cnt               = '0';
  var visualizing       = '0';
  var title             = {};
  var source            = {};
  var poster            = {};
  var artist            = {};
  var isPlaying         = {};
  var album             = {};
  var type              = {};
  var runOnce           = {};
  var isLoaded          = {};
  var listeners         = {};

  navigator.getUserMedia = (
    navigator.getUserMedia    || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);

  var audioCtx = window.AudioContext || window.webkitAudioContext;

  var audio                      = new audioCtx();
  var analyser                   = audio.createAnalyser();
  analyser.minDecibels           = -90;
  analyser.maxDecibels           = 100;
  analyser.smoothingTimeConstant = 0.85;
  var distortion                 = audio.createWaveShaper();
  var gainNode                   = audio.createGain();
  var biquadFilter               = audio.createBiquadFilter();
  var convolver                  = audio.createConvolver();

  var audioSource = {}, sourceAudio = {};

  analyser.connect(audio.destination);
  gainNode.connect(audio.destination);

  getPlayList();

  function getPlayList() {
    var Songs = {};
    trackSum < 2 ? lang['tracks'] = lang['track'] : null;
    console.log(lang['playlist']+' (' + trackSum +' '+lang['tracks']+')');

    for (var i = 0; i < playList.length; i++) {
      playList[i].currentTime = 0;
      var tracknum = i + 1;
      title[i]  = playList[i].getAttribute("title");
      source[i] = playList[i].getAttribute("src");
      type[i]   = playList[i].getAttribute("type");
      album[i]  = playList[i].getAttribute("album");
      artist[i] = playList[i].getAttribute("artist");
      poster[i] = playList[i].getAttribute("poster");
      console.log('\n' + '-'.repeat(60));
      console.log(lang['track']+' '+ tracknum);
      console.log('-'.repeat(60) + '\n');
      console.log(lang['title']+' '+ title[i]);
      console.log(lang['source']+' '+ source[i]);
      console.log(lang['mimetype']+' '+ type[i]);
      console.log(lang['artist']+' '+ artist[i]);
      console.log(lang['album']+' '+ album[i]);
      console.log(lang['poster']+' '+ poster[i]);
      Songs[i] = {
        "title ":  title[i],
        "source":  source[i],
        "type":    type[i],
        "album":   album[i],
        "artist":  artist[i],
        "poster":  poster[i]
      };
    }
    console.log('\n\n');
    audioElement      = playList[0];
    currentTrackCount = '0';
    trackCount        = '0';
    audioSource[0]    = audio.createMediaElementSource(audioElement);
    sourceAudio[0]    = 1;
    audioSource[0].connect(analyser);
    audioSource[0].connect(audio.destination);
    prevElement.classList.add("notavailable");
    nextElement.classList.add("notavailable");
    if (playList[1]) { nextElement.classList.remove("notavailable"); }
    getPoster(), populateDivs(), visualize();
  }

  function showPlayList() {}

  function logError(msg) { errorlog ?
    console.log(lang['error']+': '+msg) : null;
  }

  function logEvent(msg, msgtime) {eventlog ? 
    console.log(lang['event']+' '+msg+' '+lang['time']+' '+ msgtime) : null;
  }

  function populateDivs() {
    var audioTitle     = document.getElementById("audio_title");
    var audioArtist    = document.getElementById("audio_artist");
    var audioAlbum     = document.getElementById("audio_album");
    var audioVolume    = document.getElementById("audio_volume");
    var audioMute      = document.getElementById("audio_mute");
    var audioDuration  = document.getElementById("audio_progress");
    var audioElapsed   = document.getElementById("audio_time_elapsed");
    var audioRemaining = document.getElementById("audio_time_left");
    updateTime();
    audioTitle.innerHTML    = title[currentTrackCount];
    audioArtist.innerHTML   = artist[currentTrackCount];
    audioAlbum.innerHTML    = album[currentTrackCount];
    audioDuration.innerHTML = "";
    audioMute.innerHTML     = "";
    if (poster[currentTrackCount]) {
      getPoster(currentTrackCount);
    }
  }

  playElement.onclick = function(event) {
      playAudio();
      event.preventDefault();
    }

  nextElement.onclick = function(event) {
      stopAudio();
      currentTrackCount++;
      playList[currentTrackCount] ? true : currentTrackCount = '0';
      playAudio();
      event.preventDefault();
    }

  prevElement.onclick = function(event) {
      stopAudio();
      currentTrackCount--;
      playList[currentTrackCount] ? true : currentTrackCount = '0';
      playAudio();
      event.preventDefault();
    }

  function playAudio() {
    console.log('track count is ' + currentTrackCount);
    var trackindex = currentTrackCount;
    var nextTrack = currentTrackCount;
    var prevTrack = currentTrackCount;
    startSeekTime = 0, nextTrack++, prevTrack--;
    playList[nextTrack] ? setClass('next', '1') : setClass('next', '0');
    playList[prevTrack] ? setClass('prev', '1') : setClass('prev', '0');
    audioElement = playList[currentTrackCount];
    populateDivs(), getPoster(), audioElement.load;

    if (audioElement.readyState === 4) {
      if (!sourceAudio[trackindex]) { addAudioSource(trackindex); }
      isLoaded[trackindex] = 1;
      console.log(lang['ready']);
      statsLog();
      if (!listeners[trackindex]) { addListeners(); }
      audioElement.play();
    }

    function setClass(el, ebool) {
      el == 'next' ? el = nextElement : el = prevElement;

      if (ebool == 1) {
        el.classList.remove("notavailable");
        el.classList.add("available");
      }
      else {
        el.classList.remove("available");
        el.classList.add("notavailable");
      }
    }

    function addAudioSource(trackNum) {
      audioSource[trackNum] = audio.createMediaElementSource(audioElement);
      audioSource[trackNum].connect(analyser);
      audioSource[trackNum].connect(audio.destination);
      sourceAudio[trackNum] = 1;
    }

    function statsLog() {
      var thisduration = getTheTime(audioElement.duration);
      console.log(lang['title']+' '+ audioElement.title);
      console.log(lang['source']+' '+ audioElement.src);
      console.log(lang['time']+' '+ audioElement.currentTime);
      console.log(lang['volume']+' '+ audioElement.volume);
      console.log(lang['duration']+' '+ thisduration);
    }

    function addListeners() {
      listeners[currentTrackCount] = 1;
      console.log('Adding listeners for playing, ended, pause');

      audioElement.addEventListener("playing", function(event) {
        isPlaying[currentTrackCount] = true;
        removePoster();
        trackProgress = window.setInterval(updateTime, 1000);
        event.preventDefault();
        console.log('Next up is ' + title[nextTrack]);
      });

      audioElement.addEventListener("ended", function(event) {
        if (trackProgress) { clearInterval(trackProgress); }
        console.log(lang['playended']);
        audioElement.pause();
        audioElement.currentTime = 0;
        populateDivs(nextTrack);
        currentTrackCount = nextTrack;
        playAudio();
        event.preventDefault();
      });
      console.log('Adding pause listener for' +' '+ title[currentTrackCount]);

      audioElement.addEventListener("pause", function(event) {
        logEvent(lang['paused'], audioElement.currentTime);
        getPoster();
        canvaswrapper.style.opacity = 0;
        startSeekTime = 0; // reset start seek time
        event.preventDefault();
      });
    }
  }

  function stopAudio() {
    if (trackProgress) { clearInterval(trackProgress); }
    logEvent(lang['stopclicked'], audioElement.currentTime);
    audioElement.pause();
    audioElement.currentTime = 0;
    getPoster();
    isPlaying[currentTrackCount] = 0;
    isLoaded[currentTrackCount] = 0;
    logEvent(lang['reset'], audioElement.currentTime);
  }

  function getPoster() {
    var posterurl = 'url(' + poster[currentTrackCount]+')';
    audioplayer.style.backgroundImage = posterurl;
    audioplayer.style.backgroundRepeat = "no-repeat";
    posterwrap.style.opacity = 0; // hide our overlay
  }

  function removePoster() {
    posterwrap.style.opacity = 1;
    canvaswrapper.style.opacity = 1;
  }

  panelElement.onclick = function(event) {
    playlistPanel.classList.toggle("expand");
    event.preventDefault();
  };

  function updateTime() {
    var listenTime = Math.floor(audioElement.currentTime);
    var secondsElapsed = Math.floor(listenTime);
    var timeElapsed = getTheTime(secondsElapsed);
    audioElapsed.innerHTML = timeElapsed;

    if (audioElement.duration) {
      var timeDuration = Math.floor(audioElement.duration);
      var secondsToGo = Math.floor(timeDuration - listenTime);
      var timeLeft = getTheTime(secondsToGo);
      audioLeft.innerHTML = '-' + timeLeft;
      var progressPercent = Math.floor((listenTime / timeDuration) * 100);
      audioProgress.style.width = progressPercent + '%';
    }
  }

  function getTheTime(secs) {
    var hours = Math.floor(secs / (60 * 60));
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    hours < 10 ? hours = '0' + hours : false;
    minutes < 10 ? minutes = '0' + minutes : false;
    seconds < 10 ? seconds = '0' + seconds : false;
    var hourstime = hours+':'+ minutes+':'+ seconds;
    var minstime = minutes+':'+ seconds;
    var result;
    hours > 0 ? result = hourstime : result = minstime;
    return result;
  }

  pauseElement ?
    pauseElement.onclick = function(event) {
      audioElement.pause(), event.preventDefault();
      logEvent(lang['pauseclicked'], audioElement.currentTime);
    }: logError(lang['pause']+' '+lang['belmissing']);

  stopElement ?
    stopElement.onclick = function(event) {
      stopAudio(), event.preventDefault();
      if (trackProgress) { clearInterval(trackProgress); }
    }: logError(lang['stop']+' '+lang['belmissing']);

  function visualize() {
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    canvasCtx2.clearRect(0, 0, canvasWidth, canvasHeight);

    function draw() {
      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      canvasCtx2.clearRect(0, 0, canvasWidth, canvasHeight);
      var drawVisual = requestAnimationFrame(draw),barWidth=1,barHeight,x=0;
      analyser.getByteFrequencyData(dataArray);

      for (var i = 48; i < bufferLength; i++) {
        barHeight = dataArray[i];
        var red=105,red2=112,green=220,green2=188,blue=255,blue2=255;
        canvasCtx.fillStyle = 'rgb('+red+','+green+','+blue+')';
        canvasCtx2.fillStyle = 'rgb('+red2+','+green2+','+blue2+')';
        canvasCtx.fillRect(x, canvasHeight-barHeight, barWidth, barHeight);
        canvasCtx2.fillRect(x, canvasHeight-barHeight, barWidth, barHeight);
        x += barWidth + 0;
      }
    };
    draw();
  }
};