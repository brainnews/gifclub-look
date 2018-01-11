var gifContainer = document.getElementById('gif-container');
var settingsBar = document.getElementById('settings-bar');
var uiContainer = document.getElementById('ui-container');
var editorButton = document.getElementById('editor-button');
var editor = document.getElementById('editor');
var giphySearchMobile = document.getElementById("giphy-search-mobile");
var isMobile = false;

window.onload = function() {
    // PLATFORM CHECK
    var os = getOS();
    // var bodyHeight = $('body').height();
    // $('.wrapper').css({ height: bodyHeight });

    if (os == 'Android' || os == 'iOS') {
        isMobile = true;
        var bodyHeight = $('body').height();
        $('.wrapper').css({ height: bodyHeight })
    }

    ShowStatic();
    GetMoods();
    GetTopTracks();
    widget.pause();
};

$('.carousel').carousel({
  interval: false,
  wrap: false
});

$('.ui-carousel li').click(function(){
    if ($(this).hasClass('active')) {
    } else {
        $(this).toggleClass('active');
        $(this).siblings().removeClass('active');
    }
});

$('.btn-mobile-search').click(function () {
    $('.btn-mobile-search').addClass('hidden');
    $('.btn-mobile-search-back').removeClass('hidden');
    $('.btn-mobile-search-clear').addClass('hidden');
    $('.mobile-input').removeClass('hidden');
    $(giphySearchMobile).focus();
});

$('.btn-mobile-search-back').click(function () {
    HideSearch();
});

function HideSearch(){
    $('.btn-mobile-search').removeClass('hidden');
    $('.btn-mobile-search-back').addClass('hidden');
    $('.btn-mobile-search-clear').addClass('hidden');
    $('.mobile-input').addClass('hidden');
    $(giphySearchMobile).blur();
}

$('.btn-mobile-search-clear').click(function () {
    giphySearchMobile.value = '';
    $(giphySearchMobile).focus();
    $(this).toggleClass('hidden');
});

$(giphySearchMobile).keydown(function(){
    $('.btn-mobile-search-clear').removeClass('hidden');
});

$('.mood-info').hover(function(){
    if (!isMobile){
        $(this).removeClass('no-show', 120, 'easeInOutQuint');
    }
}, function(){
    if (!isMobile){
        $(this).addClass('no-show', 120, 'easeInOutQuint');
    }
});

$('.btn-mood-info').click(function(){
    $(this).next().toggleClass('no-show');
});

$('.btn-mobile-play-audio').click(function(){
    $('.btn-mobile-play-audio .fa').toggleClass('fa-volume-off');
    widget.getVolume(function(volume) {
        if (volume > 0){
            widget.setVolume(0);
            //$(this).children().removeClass('fa-volume-up').addClass('fa-volume-off');
        } else {
            widget.setVolume(100);
            //$(this).children().removeClass('fa-volume-off').addClass('fa-volume-up');
        }
    });
});

$('.btn-mobile-fullscreen').click(function(){
    $('#gif-container').toggleClass('fullscreen');
    $('#popupGridWrapper').toggleClass('fullscreen');
    $('#staticContainer').toggleClass('fullscreen');
    $('.popup-gif').toggleClass('rotate-90');
    $('#video-background').toggleClass('rotate-90');
});

$(editorButton).click(function(){
	$(editor).toggleClass('editor-open', 120, 'easeInOutQuint');
    $('.overlay').toggleClass('overlay-active');
    ToggleUI();
});

$('.overlay').click(function(){
    $(editor).toggleClass('editor-open', 120, 'easeInOutQuint');
    $('.overlay').toggleClass('overlay-active');
})

$('.switch-group .switch-item').click(function(){
    if ($(this).hasClass('active')) {
    } else {
        $(this).toggleClass('active');
        $(this).siblings().removeClass('active');
    }
});

function GetMoods() {
    for (x in staffPicks) {
        $('.moods-list').append('<li class="list-inline-item mood-card" data-playlist="' + staffPicks[x].title + '"><img class="mood-art" src="' + staffPicks[x].track_art + '"><p class="mood-title" id="moodTitle">' + staffPicks[x].title + '</p></li>');
    }

    $('.mood-card').click(function() {
        StopTimer();
        $('.btn-mobile-play-audio').addClass('hidden');
        $('.mood-loaded-overlay').removeClass('hidden');

        $('.mood-loaded-info').html('<span class="title placeholder w-25"></span><span class="info placeholder w-50"></span><span class="info placeholder w-75"></span><span class="info placeholder w-50"></span>');
        $('.mood-loaded-play').html('<div class="loader">Loading...</div>');

        if(editorLoaded) {
            ClearEditorTrack();
        }

        var q = $(this).data("playlist");
        LoadSoundToWidget(staffPicks[q].playlist, staffPicks[q].timeline, staffPicks[q].gpm);

        if(isMobile) {
            $(staticContainer).css('background-image', 'url(' + staffPicks[q].track_art + ')');
            $(staticContainer).removeClass('opacity-5');

            setTimeout(function(){
                $('.mood-loaded-play').html('<i class="fa fa-play btn-mobile-play-mood" aria-hidden="true"></i>');
                $('.mood-loaded-info').html('<span class="title">' + staffPicks[q].title + '</span><span class="info">Visuals by ' + staffPicks[q].visuals_by + '</span><span class="info">Sounds by ' + staffPicks[q].sounds_by + '</span><span class="info">' + staffPicks[q].duration + '</span>');
                $('.btn-mobile-play-mood').click(function(){
                    StartTimer();
                    $(staticContainer).css('background-image', 'url(images/static.gif)');
                    widget.play();
                    $(videoBackground).removeClass('hidden');
                    $(popupGridWrapper).removeClass('hidden');
                    $('.mood-loaded-overlay').toggleClass('hidden');
                    $('.btn-mobile-play-audio').removeClass('hidden');
                });
            }, 1800);
        } else {
            StartTimer();
            $(staticContainer).css('background-image', 'url(images/static.gif)');
        }

        ToggleUI();
    });
}
