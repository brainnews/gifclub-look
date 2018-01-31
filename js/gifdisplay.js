var animationFrequency = 10;
var punchFrequency = 5;
var animations = ['slideUpReturn', 'slideDownReturn','slideRightReturn','slideLeftReturn', 'puffIn'];
var hasStarted = false;
var recording = false;
var playback = false;
var gpm = 1400;
var clearRate = 2;
var gifStreamTimeout;
var clearGifsTimeout;

var timer;
var clearTimer;
var timerOn = false;

function StartTimer(){
    timerOn = true;
    // timer = setInterval(ShowGif, gpm, imageType);
    // clearTimer = setInterval(ClearPopups, clearRate);
    timer = setTimeout(ShowGif, gpm);
    //clearTimer = setTimeout(ClearPopups, clearRate);
}

function StopTimer() {
	clearTimeout(timer);
	if (timerOn) {
		$(videoBackground).html('').toggleClass('hidden');
		$(popupGridWrapper).html(emptyPopupGrid).toggleClass('hidden');
	}
	if ($('#editor').hasClass('editor-open') == false) {
		//visuals = {};
	}
	timerOn = false;
	//gifs = null;
}

function CheckPlaybackStatus() {
    if (!hasStarted) {
        $(staticContainer).css('background-image', 'url(images/static.gif)');
    }
    if (playback) {
        playback = false;
        $(playTapeButton).children().html('play_arrow');
    }
}

function ClearPopups () {
	popupGridWrapper.innerHTML = emptyPopupGrid;
}

function ShowStatic() {
	var randomNum = Math.floor(Math.random() * staticGifs.length);
	var staticGif = staticGifs[randomNum];
	$(staticContainer).css('background-image', 'url(' + staticGif + ')');
}

function ShowGif() {

	if (!hasStarted) {
		hasStarted = true;
	} 
	var numResults = gifs.length;
	var randomCell = Math.floor((Math.random() * 16) + 1);
	var randomPopup = document.getElementById('popupGif-' + randomCell);
	var randomDepth = Math.floor((Math.random() * 5) + 1);
	var randomNum = Math.floor((Math.random() * numResults));
	var randomNum2 = Math.floor((Math.random() * numResults));
	var fileType = ext(gifs[randomNum]);

	if (fileType == '.mp4') {
		videoBackground.innerHTML = '<video autoplay loop playsinline id="video-background" muted><source src="' + gifs[randomNum] + '"></video>';

		if (litMode && randomPopup) {
			randomPopup.innerHTML = '<video autoplay loop playsinline id="video-background" class="video-popup" muted><source src="' + gifs[randomNum2] + '"></video>';
		}
	} else {
		videoBackground.innerHTML = '<img id="video-background" src="' + gifs[randomNum] + '" width="100%" />';
		if (litMode && randomPopup) {
			randomPopup.innerHTML = '<img class="video-popup" src="' + gifs[randomNum2] + '" width="100%" />';
		}
	}
	//old record tape code
	
	// else {
	// 	numResults = recordTapeArray.length;
	// 	var randomNum = Math.floor((Math.random() * numResults));
	// 	var randomNum2 = Math.floor((Math.random() * numResults));

	// 	if (isMobile) {
	// 		channelgif = recordTapeArray[randomNum];
	// 		channelgifPopup = recordTapeArray[randomNum2];
	// 		videoBackground.innerHTML = '<img id="video-background" src="' + channelgif + '" width="100%" />';
	// 		if (randomPopup) {
	// 			randomPopup.innerHTML = '<img class="video-popup z-depth-' + randomDepth +'" src="' + channelgifPopup + '" width="100%" />';
	// 		}
	// 	} else {
	// 		channelgif = recordTapeArray[randomNum];
	// 		channelgifPopup = recordTapeArray[randomNum2];
	// 		videoBackground.innerHTML = '<video autoplay loop playsinline id="video-background" muted><source src="' + channelgif + '"></video>';
	// 		if (randomPopup) {
	// 			randomPopup.innerHTML = '<video autoplay loop playsinline id="video-background" class="video-popup z-depth-' + randomDepth +'" muted><source src="' + channelgifPopup + '"></video>';
	// 		}
	// 	}
	// }

	if (Math.floor(Math.random() * 10) < animationFrequency) {
		var randomAnimation = animations[Math.floor((Math.random() * animations.length) + 1)];
		$(randomPopup).addClass(randomAnimation);
	}

	if (Math.floor(Math.random() * 10) < clearRate) {
		ClearPopups();
	}

	StartTimer();
}