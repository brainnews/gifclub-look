var searchButton = document.getElementById("giphy-search-button");
var giphySearch = document.getElementById("giphy-search");
var gifs = [];
var preHTML = '<img src="';
var postHTML = '" />';
var gifIndex = 0;
var searchLimit = 50;
var staticGifs;
var staticSearchLimit = 30;

var searchUrlPre = 'https://api.giphy.com/v1/gifs/search?q=';
var trendingUrl = 'https://api.giphy.com/v1/gifs/trending?api_key=' + config + '&limit=50';
var searchUrlPost = '&api_key=' + config + '&limit=';


function GetGifs(q) {
	StopTimer();

	if (q.startsWith('https://www.are.na')){
		var lastSlash = q.lastIndexOf('/');
		var channelTitle = q.slice(lastSlash + 1);
		$.ajax({
		  	url: 'http://api.are.na/v2/channels/' + channelTitle + '/contents',
		  	type: 'GET',
		  	success: function(data) {
		  		gifs = ParseArenaChannel(data);
		  	}
		});
	} else if (q.includes('#')) {
		var queryWithLimit = q.split('#');
		$.ajax({
		  	url: searchUrlPre + queryWithLimit[0] + searchUrlPost + queryWithLimit[1],
		  	type: 'GET',
		  	success: function(data) {
				gifs = ParseGifs(data);
		  	}
		});
	} else {
		$.ajax({
		  	url: searchUrlPre + q + searchUrlPost + searchLimit,
		  	type: 'GET',
		  	success: function(data) {
				gifs = ParseGifs(data);
		  	}
		});
	}

	if (!hasStarted) {
        $(staticContainer).css('background-image', 'url(images/static.gif)');
    }

    StartTimer();
}

function CustomSearch(q) {
	HideSearch();

	StopTimer();
	var customSearchLimit;

	if (q.startsWith('https://www.are.na')){
		var lastSlash = q.lastIndexOf('/');
		var channelTitle = q.slice(lastSlash + 1);
		$.ajax({
		  	url: 'http://api.are.na/v2/channels/' + channelTitle + '/contents',
		  	type: 'GET',
		  	success: function(data) {
		  		gifs = ParseArenaChannel(data);
				StartTimer();
		  	}
		});
	} else if (q.includes('#')) {
		var queryWithLimit = q.split('#');
		$.ajax({
		  	url: searchUrlPre + queryWithLimit[0] + searchUrlPost + queryWithLimit[1],
		  	type: 'GET',
		  	success: function(data) {
				gifs = ParseGifs(data);
				StartTimer();
		  	}
		});
	} else {
		$.ajax({
		  	url: searchUrlPre + q + searchUrlPost + searchLimit,
		  	type: 'GET',
		  	success: function(data) {
				gifs = ParseGifs(data);
				StartTimer();
		  	}
		});
	}

	if (!hasStarted) {
        $(staticContainer).css('background-image', 'url(images/static.gif)');
    }
}

function MoodSearch(q, limit) {
	$.ajax({
	  	url: searchUrlPre + q + searchUrlPost + limit,
	  	type: 'GET',
	  	success: function(data) {
		gifs = ParseGifs(data);
		StartGifStream();
		ToggleUI();
	  }
	});
	if (!hasStarted) {
        $(staticContainer).css('background-image', 'url(images/static.gif)');
    }
    if (playback) {
    	playback = false;
    	$(playTapeButton).children().html('play_arrow');
    }
}

function GetStatic(){
	$.ajax({
	  url: searchUrlPre + 'static' + searchUrlPost + staticSearchLimit,
	  type: 'GET',
	  success: function(data) {
		staticGifs = ParseGifs(data);;
		ShowStatic();
	  }
	});
}

function ParseGifs(obj) {
	var gifArray = [];
	for(i = 0; i < Object.keys(obj.data).length; i++){
		gifArray.push(obj.data[i].images.original_mp4.mp4);
	}
	return gifArray;
}

function ParseArenaChannel(obj) {
	var gifArray = [];
	for(i = 0; i < Object.keys(obj.contents).length; i++){
		if (obj.contents[i].hasOwnProperty('image') && obj.contents[i].image !== null){
			gifArray.push(obj.contents[i].image.original.url);
		}
	}
	return gifArray;
}