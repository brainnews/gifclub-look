var animationFrequency = 10;
var punchFrequency = 5;
var animations = ['slideUpReturn', 'slideDownReturn','slideRightReturn','slideLeftReturn', 'puffIn'];
var hasStarted = false;
var recording = false;
var playback = false;
var gpm = 1400;
var clearRate = 10000;
var numResults;
var gifStreamTimeout;
var clearGifsTimeout;

var timer;
var clearTimer;
var timerOn = false;

function StartTimer(){
	console.log("timer playing");
    timerOn = true;
    timer = setInterval(ShowGif, gpm);
    clearTimer = setInterval(ClearPopups, clearRate);
}

function StopTimer() {
	if (timerOn) {
		$(videoBackground).html('').toggleClass('hidden');
		$(popupGridWrapper).html(emptyPopupGrid).toggleClass('hidden');
	}
	//visuals = {};
	timerOn = false;
	channelgifs = null;
	console.log("timer stopped");
    clearInterval(timer);
    clearInterval(clearTimer);
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

	var channelgif;
	var channelgifPopup;
	var randomCell = Math.floor((Math.random() * 16) + 1);
	var randomPopup = document.getElementById('popupGif-' + randomCell);
	var randomDepth = Math.floor((Math.random() * 5) + 1);

	if (channelgifs) {
		numResults = Object.keys(channelgifs.data).length;
		var randomNum = Math.floor((Math.random() * numResults));
		var randomNum2 = Math.floor((Math.random() * numResults));
		
		if (isMobile) {
			channelgif = channelgifs.data[randomNum].images.preview_webp.url;
			channelgifPopup = channelgifs.data[randomNum2].images.preview_webp.url;
			videoBackground.innerHTML = '<img id="video-background" src="' + channelgif + '" width="100%" />';
			if (randomPopup) {
				randomPopup.innerHTML = '<img class="video-popup z-depth-' + randomDepth +'" src="' + channelgifPopup + '" width="100%" />';
			}
		} else {
			if (typeof(channelgifs.data[randomNum].images.original_mp4) == 'undefined') {
				var largeGIF = 'images/static.gif';
			} else {
				var largeGIF = channelgifs.data[randomNum].images.original_mp4.mp4;
			}
			var smallGIF = channelgifs.data[randomNum2].images.preview.mp4;
			if (largeGIF) {
				channelgif = largeGIF;
			}
			videoBackground.innerHTML = '<video autoplay loop playsinline id="video-background" muted><source src="' + channelgif + '"></video>';

			if (litMode) {
				if (smallGIF) {
					channelgifPopup = smallGIF;
				}
				if (randomPopup) {
					randomPopup.innerHTML = '<video autoplay loop playsinline id="video-background" class="video-popup z-depth-' + randomDepth +'" muted><source src="' + channelgifPopup + '"></video>';
				}
			}
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
}