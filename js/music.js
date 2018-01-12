var duration;
var visuals = {};
var playing = false;
var millis = 0;
var counter;
var isPaused = true;
var trackInfoContainer = document.getElementById('trackInfoContainer');
var soundCloudSearch = document.getElementById('soundCloudSearch');
var loadedTrackInfoContainer = document.getElementById('loadedTrackInfoContainer');
var loadTrackButton = document.getElementById('loadTrackButton');
var editLoadedTrackButton;
var clientId = 'ARX6YqJeUZYURsTksMBlqrzkPmdLqI3x';
var playlistTracks = [];
var currentTrackNum = 0;
var ended;
var editorLoaded = false;
var userStarted = false;
var loadedTrackUrl;
//var trackScrubber = document.getElementById('trackScrubber');
var msDuration;
var gifSearchTimecode;
var editorArray = [];
var editorPlayPauseButton = document.getElementById('editorPlayPauseButton');
var soundCloudSearchContainer = document.getElementById('soundCloudSearchContainer');
var loadPlaylistButton = document.getElementById('loadPlaylistButton');
var loadUrlContainer = document.getElementById('loadUrlContainer');
var trackDurationContainer = document.getElementById('trackDurationContainer');
var scrubberInputContainer = document.getElementById('scrubberInputContainer');
var scrubberButton = document.getElementById('scrubberButton');
var scrubberbuttoncontainer = document.getElementById('scrubberbuttoncontainer');

var scrubberInput = document.getElementById('scrubberInput');
var scrubberInputOpen = false;
var trackProgress;
var trackMillis;
var previewTimelineButton = document.getElementById("previewTimelineButton");

var trackInputHtml = "<input id='soundCloudSearch' class='input-small' type='text' placeholder='Enter a SoundCloud URL (Track, Artist, or Playlist)' name='soundcloud-search'>";

var pipHtmlPre = '<div class="noUi-value noUi-value-horizontal noUi-value-large search-pip" style="left: ';

var trackArt = document.getElementById('trackArt');
var trackTitle = document.getElementById('trackTitle');
var trackCreator = document.getElementById('trackCreator');

var slider = document.getElementById('trackScrubber');

var editorMenuHtml = 
				"<a class='dropdown-button' href='#' data-activates='dropdown1'><i class='material-icons'>more_vert</i></a><ul id='dropdown1' class='dropdown-content'><li><a href='#!'>Save track</a></li><li class='divider'></li><li><a href='#!''>Clear track</a></li></ul>";

var preloaderHtml = '<div class="progress"><div class="indeterminate"></div></div>';

SC.initialize({
  client_id: clientId
});

noUiSlider.create(slider, {
	start: [0],
	connect: [true, false],
	range: {
	 'min': 0,
	 'max': 100
	},
	pips: {
		mode: 'positions',
		values: [],
		density: 4
	}
});

var pips = slider.querySelector('.noUi-pips');

var customTrack = {
	"name": "Test",
	"timeline": {

	}
};

var timeline = {};

var widgetIframe = document.getElementById('sc-widget'), 
widget = SC.Widget(widgetIframe);

widget.bind(SC.Widget.Events.READY, function() {
	widget.bind(SC.Widget.Events.PLAY, function() { 
		// get information about currently playing sound 
		widget.getCurrentSound(function(currentSound) {
			var art = currentSound.artwork_url;
			var maxLength = 22;
			var title = currentSound.title;
			var artist = currentSound.user.username;
			var url = currentSound.permalink_url;

			if (editorLoaded) {
				$(trackArt).html('<img src="' + art + '" class="img-fluid img-circle">');
				$(trackTitle).html('<a href="' + url + '" target="_blank">' + title + '</a>');
				$(trackCreator).html(artist);
				
			} else {
				$(trackInfoContainer).attr("href", url);
				if (title.length > maxLength) {
					var truncatedTitle = title.substring(0, maxLength);
					$(trackInfoContainer).html("Now playing: " + truncatedTitle + "... by " + artist);
				} else {
					$(trackInfoContainer).html("Now playing: " + title + " by " + artist);
				}
			}
		});
		widget.getDuration(function(duration) {
			msDuration = duration;
			$(trackDurationContainer).html(" / " + msToTime(msDuration));
		});
		if (!userStarted && editorLoaded) {
			widget.seekTo(0);
			widget.pause();
		}
	});

	widget.bind(SC.Widget.Events.FINISH, function() {
		//StopTimer();
		playing = false;
		$(editorPlayPauseButton).children().removeClass('fa-pause').addClass('fa-play');
	});

	widget.bind(SC.Widget.Events.PLAY_PROGRESS, function() {
		widget.getPosition(function(position) {
			gifSearchTimecode = msToTime(position);
			trackMillis = Math.round(position / 100) * 100;
			//console.log(trackMillis);
			//trackMillis = Math.trunc(position);
			$('.active-time-code').html(gifSearchTimecode);
			trackProgress = msToPercent(position, msDuration);
			slider.noUiSlider.set(trackProgress);
			if (trackProgress >= 80 && scrubberInputOpen == true) {
				$(scrubberButtonContainer).css("margin-left", "-145px");
			} else {
				$(scrubberButtonContainer).css("margin-left", "-15px");
			}
			$(scrubberButtonContainer).css("left", trackProgress + "%");

			for (x in visuals) {
		    	if (x == trackMillis && playing == true) {
		    		console.log("Search: " + visuals[x]);
		    		GetGifs(visuals[x]);
		    	}
			}

		});
	});

	widget.bind(SC.Widget.Events.PAUSE, function() {
		playing = false;
		$(editorPlayPauseButton).children().removeClass('fa-pause').addClass('fa-play');
	});

	widget.bind(SC.Widget.Events.PLAY, function() {
		playing = true;
		$(editorPlayPauseButton).children().removeClass('fa-play').addClass('fa-pause');
	});

	widget.bind(SC.Widget.Events.SEEK, function() {
		widget.getPosition(function(position) {
			seekTimeCode = msToTime(position);
			console.log("seeking to " + seekTimeCode);
			for (x in visuals) {
		    	if (x < position) {
		    		console.log("Seeking to: " + visuals[x]);
		    		GetGifs(visuals[x]);
		    	}
			}
		});
	});
});

$(soundCloudSearch).keydown(function( event ) {
	if (event.which == 13) {
	   	FetchTrackForEditor();
	}
});

function FetchTrackForEditor(){
	if (soundCloudSearch.value != '') {
	   	editorLoaded = true;
		ToggleEditorData();
		LoadTrackForEditor(soundCloudSearch.value);
		$(staticContainer).css('background-image', 'url(images/static.gif)');
	} else {
		soundCloudSearch.value = 'Please enter a SoundCloud URL';
	}
}

function ToggleEditorData() {
	$('#editor-load').toggleClass('hidden');
	$('#editor-loaded').toggleClass('hidden');
}

function LoadSoundToWidget (q, t, g) {
	//var q = musicSearch.value;
	editorLoaded = false;
	widget.load(q, {
		"auto_play": "true",
		"buying": "false",
		"liking": "false",
		"download": "false",
		"sharing": "false",
		"show_artwork": "false",
		"show_comments": "false",
		"show_playcount": "false",
		"show_user": "false"
	});
	visuals = t;
	gpm = g;
	//PlayVisuals();
}

function LoadStaffSound (q) {
	//var q = musicSearch.value;
	editorLoaded = false;
	widget.load(q, {
		"auto_play": "true",
		"buying": "false",
		"liking": "false",
		"download": "false",
		"sharing": "false",
		"show_artwork": "false",
		"show_comments": "false",
		"show_playcount": "false",
		"show_user": "false"
	});
}

function LoadTrackForEditor (q) {
	editorLoaded = true;
	widget.load(q, {
		"auto_play": "true",
		"buying": "false",
		"liking": "false",
		"download": "false",
		"sharing": "false",
		"show_artwork": "false",
		"show_comments": "false",
		"show_playcount": "false",
		"show_user": "false"
	});
	StartTimer();
}

function PlayVisuals() {
	StartGifStream();
	counter = setInterval(function(){
		if (!editorLoaded) {
			for (x in visuals) {
		    	if (x == millis) {
		    		console.log("timestamp matched: " + visuals[x]);
		    		GetGifs(visuals[x]);
		    	}
			}
		}
		millis = millis + 1000;
	}, 1000);


	clearGifsTimeout = setInterval(function(){
    	popupGridWrapper.innerHTML = emptyPopupGrid;
    }, clearRate);
}

function ConvertTimestamp(timestamp) {
	var a = timestamp.split(":");
	var timeInMs = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);;
	return timeInMs * 1000;
}

function ResetMusic() {
	clearInterval(counter);
	widget.pause();
	millis = 0;
}

function StopSelectsVisuals() {
	clearInterval(counter);
	millis = 0;
}

if (duration == millis) {
	widget.pause();
}

function msToTime(duration) {
    var seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    if (hours > 0) {
    	return hours + ":" + minutes + ":" + seconds;
    } else {
    	return minutes + ":" + seconds;
    }
}

function msToPercent(milliseconds, duration) {
	return ((milliseconds/duration) * 100);
}

// $(trackScrubber).on('input', function (){
// 	var seekPosition = msDuration * (trackScrubber.value / 100);
// 	console.log(trackScrubber.value);
//     widget.seekTo(seekPosition);
// });

slider.noUiSlider.on('slide', function(){
	var seekPosition = slider.noUiSlider.get();
	var seekPercentage = msDuration * (seekPosition / 100);
    widget.seekTo(seekPercentage);
});


$(editorPlayPauseButton).click(function(){
	if(playing) {
		widget.pause();
	} else if (!playing) {
		widget.play();
		userStarted = true;
	}
});

function ClearEditorTrack(){
	StopTimer();
	editorLoaded = false;
	userStarted = false;
	playing = false;
	widget.pause();
	ToggleEditorData();
	ClearVisuals();
	soundCloudSearch = document.getElementById('soundCloudSearch');
	soundCloudSearch.value = "";
	$(trackArt).html('<div class="loader">Loading...</div>');
	$(trackTitle).html('');
	$(trackCreator).html('');
}

$(scrubberButton).click(function() {
	scrubberInputOpen = true;
	widget.pause();
	$(scrubberButton).addClass('hidden');
	$(scrubberInputContainer).removeClass('hidden');
});

$('.input-close').click(function() {
	CloseGifSearch();
});

$(scrubberInput).keydown(function( event ) {
	if ( event.which == 13 ) {
		//create and populate the key value pair in timeline
		var inputQuery = scrubberInput.value;
	   	visuals[trackMillis] = inputQuery;
	   	GetGifs(inputQuery);
	   	$(pips).append(pipHtmlPre + trackProgress + '%;" data-millis="' + trackMillis + '" title="' + inputQuery + '">' + inputQuery + '</div>');
	  	createDraggable();
	   	CloseGifSearch();
	}
});

function createDraggable() {
	var recoupLeft, recoupTop;
	var positionInPercent;
	var currentMillis;
	var newMillis;
	var elHeight = $(this).height();
	$('.search-pip').dblclick(function() {
  		$(this).remove();
  		var pipMillis = $(this).attr('data-millis');
  		delete visuals[pipMillis];
	});

	$('.search-pip').draggable({
		addClasses: false,
		axis: 'x',
		containment: pips,
		scroll: false,
		cursor: 'ew-resize',
		start: function (event, ui) {
            var left = parseInt($(this).css('left'),10);
            left = isNaN(left) ? 0 : left;
            var top = parseInt($(this).css('top'),10);
            top = isNaN(top) ? 0 : top;
            recoupLeft = left - ui.position.left;
            recoupTop = top - ui.position.top;
            //get current position of search in millis
            currentMillis = $(this).attr('data-millis');
        },
        drag: function (event, ui) {
            ui.position.left += recoupLeft;
            ui.position.top += recoupTop;
        },
        stop: function (event, ui) {
        	//update HTML position to be in percent rather than px (not entirely necessary, but I like it for cleanliness)
        	positionInPercent = (ui.position.left / pips.offsetWidth) * 100;
			$(this).css('left', Math.round(positionInPercent * 10) / 10 + '%');
        	//get new position of search in millis
        	newMillis = Math.round(Math.trunc(positionInPercent / 100 * msDuration) / 100) * 100;
        	//newMillis = Math.trunc(positionInPercent / 100 * msDuration);
        	//update data-millis with new position in millis
        	$(this).attr('data-millis', newMillis);
        	//push new millis to timeline and delete old one
        	visuals[newMillis] = visuals[currentMillis];
			delete visuals[currentMillis];
        }
	});
}

function CloseGifSearch(){
	scrubberInputOpen = false;
	widget.play();
	$(scrubberInput).val('');
	$(scrubberInputContainer).addClass('hidden');
	$(scrubberButton).removeClass('hidden');
}

function ClearVisuals() {
	console.log("Visuals cleared!");
	$('.noUi-pips').html("");
	visuals = {};
}

function GetTopTracks(){
	var today = new Date();
	var year = today.getFullYear();
	var month = today.getMonth();
	var day = today.getDate();

	if (month > 0) {
		month = month - 1;
	} else {
		month = 11;
		year = year - 1;
	}

	if (month < 10) {
		month = "0" + month;
	}

	if (day < 10) {
		day = "0" + day;
	}

	var time = msToTime(today.getTime());
	formattedTime = year + '-' + month + '-' + day + ' ' + time;
	console.log(formattedTime);

	SC.get('/tracks', {
		q: 'flip',
	  	limit: 5,
	  	created_at: {from: formattedTime}
	}).then(function(tracks) {
		for (i = 0; i < tracks.length; i++) {
	  		var permalink = tracks[i].permalink_url;
	  		var title = tracks[i].title;
	  		var artist = tracks[i].user.username;
	  		var art = tracks[i].artwork_url;
	  		$('#staffSoundsFlips').append('<li class="staff-sound-link" data-url="' + permalink + '"><img src="' + art + '" class="float-left" alt="track art"><p class="text-truncate mb-6">' + title + ' <a href="' + permalink + '" target="_blank"><i class="fa fa-external-link-square sc-link" aria-hidden="true"></i></a></p><p class="text-truncate small">' + artist + '</p><div class="play-indicator hidden">now playing</div></li>');
	  	}

	  	$('.staff-sound-link').click(function() {
		    if(editorLoaded) {
		        ClearEditorTrack();
		    }
		    ResetMusic();
		    var q = $(this).data("url");
		    LoadStaffSound(q);
		    $(this).find('.play-indicator').removeClass('hidden');
		    $(this).siblings().find('.play-indicator').addClass('hidden');
		});
	});
}