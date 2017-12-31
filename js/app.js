var gifContainer = document.getElementById('gif-container');
var settingsBar = document.getElementById('settings-bar');
var uiContainer = document.getElementById('ui-container');
var editorButton = document.getElementById('editor-button');
var editor = document.getElementById('editor');
var isMobile = true;

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
    ToggleMobileSearch();
});

function ToggleMobileSearch() {
    $('.btn-mobile-search').siblings().toggleClass('hidden', 200, function() {
        if($(giphySearchMobile).is(":focus")){
            $(giphySearchMobile).blur();
        } else {
            $(giphySearchMobile).focus();
        }
    });
    $('.btn-mobile-search').children('.fa').toggleClass('fa-times');
}

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
    if (playing) {
        widget.pause();
    } else {
        widget.play();
    }
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

function ForcePlayWidget(){
    widget.play();
}
