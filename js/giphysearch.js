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
	if (q.includes('#')) {
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
}

function GetTrending() {
	$.ajax({
	  url: trendingUrl,
	  type: 'GET',
	  success: function(data) {
		gifs = ParseGifs(data);
		//console.log(channelgifs);
		//StartGifStream();
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

$(giphySearch).keydown(function( event ) {
	if ( event.which == 13 ) {
		CustomSearch();
	}
});

$(giphySearchMobile).keydown(function( event ) {
	if ( event.which == 13 ) {
		CustomSearch();
		giphySearchMobile.blur();
	}
});

$(searchButton).click(function(){
	if (giphySearch.value != '') {
		CustomSearch();
	} else {
		giphySearch.value = "Enter something";
	}
})

function CustomSearch() {
	HideSearch();
	StopTimer();
	var query;
	var customSearchLimit;

	if (giphySearchMobile.value != '') {
		query = giphySearchMobile.value;
	} else {
		query = giphySearch.value;
	}

	if (query.startsWith('https://www.are.na')){
		var lastSlash = query.lastIndexOf('/');
		var channelTitle = query.slice(lastSlash + 1);
		console.log(channelTitle);
		$.ajax({
		  	url: 'http://api.are.na/v2/channels/' + channelTitle + '/contents',
		  	type: 'GET',
		  	success: function(data) {
		  		gifs = ParseArenaChannel(data);
				StartTimer('gif');
		  	}
		});
	} else if (query.includes('#')) {
		var queryWithLimit = query.split('#');
		$.ajax({
		  	url: searchUrlPre + queryWithLimit[0] + searchUrlPost + queryWithLimit[1],
		  	type: 'GET',
		  	success: function(data) {
				gifs = ParseGifs(data);
				StartTimer('mp4');
		  	}
		});
	} else {
		$.ajax({
		  	url: searchUrlPre + query + searchUrlPost + searchLimit,
		  	type: 'GET',
		  	success: function(data) {
				gifs = ParseGifs(data);
				StartTimer('mp4');
		  	}
		});
	}

	if (!hasStarted) {
        $(staticContainer).css('background-image', 'url(images/static.gif)');
    }
    if (playback) {
    	playback = false;
    	$(playTapeButton).children().html('play_arrow');
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
		if (obj.contents[i].hasOwnProperty('image')){
			gifArray.push(obj.contents[i].image.original.url);
		}
	}
	return gifArray;
}