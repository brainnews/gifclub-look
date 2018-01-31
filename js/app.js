var gifContainer = document.getElementById('gif-container');
var settingsBar = document.getElementById('settings-bar');
var uiContainer = document.getElementById('ui-container');
var editor = document.getElementById('editor');
var giphySearchMobile = document.getElementById("giphy-search-mobile");
var isMobile = false;

window.onload = function() {
    console.log('\n G | I | F | C | l | u | b \n\n Audio Visual System\n version 1.0');
    initApp();
    // PLATFORM CHECK
    widget.pause();
    var os = getOS();
    // var bodyHeight = $('body').height();
    // $('.wrapper').css({ height: bodyHeight });

    if (os == 'Android' || os == 'iOS') {
        isMobile = true;
        var bodyHeight = $('body').height();
        $('.wrapper').css({ height: bodyHeight })
    }
    new Clipboard('.get-short-link');
    ShowStatic();
    GetPublicMoods();
};

function CatchMoodID(){
    let params = (new URL(document.location)).searchParams;
    let mood = params.get("mood");
    if (mood) {
        var query = firebase.database().ref("public_moods");

        query.once("value")
          .then(function(snapshot) {
            var publicMoods = snapshot.val();
            LoadSoundToWidget(publicMoods[mood].track_url, publicMoods[mood].timeline, publicMoods[mood].gpm);
            StartVisuals(publicMoods, mood);
            ToggleUI();
        });
    }
}

function GetPublicMoods(){
    var query = firebase.database().ref("public_moods").orderByKey();
    query.once("value")
      .then(function(snapshot) {
        var publicMoods = snapshot.val();
        snapshot.forEach(function(childSnapshot) {
            console.log('getting public moods');
            // key will be "ada" the first time and "alan" the second time
            var key = childSnapshot.key;
            // childData will be the actual contents of the child
            var moodData = childSnapshot.val();

            $('.moods-list').append('<li class="list-inline-item mood-card" data-playlist="' + key + '"><img class="mood-art" src="' + moodData.track_art + '"><p class="mood-title" id="moodTitle">' + moodData.mood_title + '</p></li>');

            $('#mood-loader').remove();

            $('.mood-card').click(function() {
                //StopTimer();
                var q = $(this).data("playlist");
                LoadSoundToWidget(publicMoods[q].track_url, publicMoods[q].timeline, publicMoods[q].gpm);
                StartVisuals(publicMoods, q);
                ToggleUI();
            });

      });
    });
}

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

// $('.btn-mobile-search').click(function () {
//     $('.btn-mobile-search').addClass('hidden');
//     $('.btn-mobile-search-back').removeClass('hidden');
//     $('.mobile-input').removeClass('hidden');
//     $(giphySearchMobile).focus();
// });

// $('.btn-mobile-search-back').click(function () {
//     HideSearch();
// });

function HideSearch(){
    $(giphySearchMobile).blur();
    ToggleUI();
}

// $('.btn-mobile-search-back').click(function () {
//     giphySearchMobile.value = '';
//     $(giphySearchMobile).focus();
//     $(this).toggleClass('hidden');
// });


$(giphySearchMobile).keydown(function( event ) {
    if ( event.which == 13 ) {
        q = giphySearchMobile.value;
        CustomSearch(q);
        giphySearchMobile.blur();
    }
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

function OpenEditor(){
    $(editor).addClass('editor-open', 120, 'easeInOutQuint');
    $('.overlay').addClass('overlay-active');
}

$('#editor-button').click(function(){
    OpenEditor();
    ToggleUI();
});

$('.overlay').click(function(){
    $(editor).removeClass('editor-open', 120, 'easeInOutQuint');
    $('.overlay').removeClass('overlay-active');
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
        $('.moods-list').append('<li class="list-inline-item mood-card" data-playlist="' + staffPicks[x].mood_title + '"><img class="mood-art" src="' + staffPicks[x].track_art + '"><p class="mood-title" id="moodTitle">' + staffPicks[x].mood_title + '</p></li>');
    }
    $('#mood-loader').remove();

    $('.mood-card').click(function() {
        //StopTimer();
        var q = $(this).data("playlist");
        LoadSoundToWidget(staffPicks[q].playlist, staffPicks[q].timeline, staffPicks[q].gpm);
        StartVisuals(staffPicks, q);
        ToggleUI();
    });
}

function StartVisuals(db, q){
    StopTimer();
    $('.btn-mobile-play-audio').addClass('hidden');
    $('.mood-loaded-overlay').removeClass('hidden');

    $('.mood-loaded-info').html('<span class="title placeholder w-25"></span><span class="info placeholder w-50"></span><span class="info placeholder w-75"></span><span class="info placeholder w-50"></span>');
    $('.mood-loaded-play').html('<div class="loader">Loading...</div>');

    if(editorLoaded) {
        ClearEditorTrack();
    }

    if(isMobile) {
        $(staticContainer).css('background-image', 'url(' + db[q].track_art + ')');
        $(staticContainer).removeClass('opacity-5');

        setTimeout(function(){
            $('.mood-loaded-play').html('<i class="fa fa-play btn-mobile-play-mood" aria-hidden="true"></i>');
            $('.mood-loaded-info').html('<span class="title">' + db[q].mood_title + '</span><span class="info">Visuals by ' + db[q].visuals_by + '</span><span class="info">Sounds by ' + db[q].sounds_by + '</span><span class="info">' + db[q].duration + '</span>');
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
}


$('#no-login').click(function(){
    $('#ui-container').show();
    $('#topbar').show();
    $('#loginView').hide();
});

$('#topbar-login').click(function(){
    $('#ui-container').hide();
    $('#topbar').hide();
    $('#loginView').show();
});

function ext(url) {
    return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split('#')[0].substr(url.lastIndexOf("."))
}

//turn to inline mode
$.fn.editable.defaults.mode = 'inline';

$(document).ready(function() {
    $('.editable').editable({
        showbuttons: false,
        url: function() {
            setTimeout(SaveMood, 500);
        }
    });
});
