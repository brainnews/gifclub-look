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
