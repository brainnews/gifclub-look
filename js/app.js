var gifContainer = document.getElementById('gif-container');
var settingsBar = document.getElementById('settings-bar');
var uiContainer = document.getElementById('ui-container');
var editorButton = document.getElementById('editor-button');
var editor = document.getElementById('editor');
var isMobile = false;

window.onload = function() {
    // PLATFORM CHECK
    var os = getOS();

    if (os == 'Android') {
        isMobile = true;
    } else if ( os == 'iOS') {
        isMobile == true;
        $(iphoneUiButton).removeClass('hide');
    }

    ShowStatic();
};

$('.carousel').carousel({
  interval: false,
  wrap: false
});

$('.ui-carousel li').click(function(){
    if ($(this).hasClass('active')) {
        console.log("already active tab");
    } else {
        $(this).toggleClass('active');
        $(this).siblings().removeClass('active');
    }
});


$('.mood-info').hover(function(){
    $(this).removeClass('invisible', 120, 'easeInOutQuint');
    }, function(){
    $(this).addClass('invisible', 120, 'easeInOutQuint');
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

