var currentUserMoods = null;
var mood_id = null;
var currentMoodKey = null;
var currentUser = null;
var hasSaved = false;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBu4sm9IjmA3M1rxX3EpgyPb9DfkXj7MPw",
  authDomain: "gifclub-b96ad.firebaseapp.com",
  databaseURL: "https://gifclub-b96ad.firebaseio.com",
  projectId: "gifclub-b96ad",
  storageBucket: "gifclub-b96ad.appspot.com",
  messagingSenderId: "360117009747"
};
firebase.initializeApp(config);
// Get a reference to the database service
var database = firebase.database();

// FirebaseUI config.
var uiConfig = {
	signInSuccessUrl: 'index.html',
	signInOptions: [
  		// Leave the lines as is for the providers you want to offer your users.
  		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  		//firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  		//firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  		//firebase.auth.GithubAuthProvider.PROVIDER_ID,
  		//firebase.auth.EmailAuthProvider.PROVIDER_ID,
  		//firebase.auth.PhoneAuthProvider.PROVIDER_ID
		],
	signInFlow: 'popup',
	// Terms of service url.
	tosUrl: 'tos.html'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());


//Track user
initApp = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $('#loginView').hide();
      $('#ui-container').show();
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var uid = user.uid;
      currentUser = user;
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;

      user.getIdToken().then(function(accessToken) {
        $('#user-info').html('<div class="dropdown"><img class="user-photo dropdown-toggle" id="accountDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" src="' + photoURL + '"><div class="dropdown-menu" aria-labelledby="accountDropdownButton"><ul class="list-unstyled mb-0"><li><h6>' + displayName + '</h6></li><li><a id="sign-out" href="#">Sign out</a></li></ul></div></div>');

      	document.getElementById('welcome-message').innerHTML = 'Your moods <button class="float-right btn btn-new-mood editor-button">create new mood</button>';

        $('.editor-button').click(function(){
          $(editor).toggleClass('editor-open', 120, 'easeInOutQuint');
            $('.overlay').toggleClass('overlay-active');
            ToggleUI();
        });

        $("#sign-out").click(function(){
	  		  SignOut();
        });
      });

      //Get object of user's moods
	    var ref = firebase.database().ref('/users/' + uid + '/moods/');

      ref.on('child_added', function(childSnapshot, prevChildKey) {
        var added_mood = childSnapshot.val();
        var mood_key = childSnapshot.key;
        
        $('#user-moods-list').prepend('<li data-mood-id="' + mood_key + '" class="list-inline-item text-center user-mood-thumb"><div class="dropdown"><i id="dLabel" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="fa fa-ellipsis-h" aria-hidden="true"></i><div class="dropdown-menu" aria-labelledby="dLabel"><ul class="list-unstyled"><li><a class="edit-user-mood" data-mood-id="' + mood_key + '" href="#">Edit mood</a></li><li><a class="delete-user-mood" data-mood-id="' + mood_key + '" href="#">Delete mood</a></li><li><a class="get-short-link" data-mood-id="' + mood_key + '" data-clipboard-text="thegif.club/?mood=' + mood_key + '" href="#">Shareable link</a></li></ul></div></div><img data-mood-id="' + mood_key + '" class="mb-6 mood-thumb" src="' + added_mood.track_art + '"><p class="text-truncate">' + added_mood.mood_title + '</p></li>');

        $('.mood-thumb').click(function(){
          var keyToPlay = $(this).data('mood-id');
          
          ref.once('value').then(function(snapshot) {
            var moodObj = snapshot.val();
            LoadSoundToWidget(moodObj[keyToPlay].track_url, moodObj[keyToPlay].timeline, moodObj[keyToPlay].gpm);
            StartVisuals(moodObj, keyToPlay);
            ToggleUI();
          });
        });
      });

      ref.on('child_removed', function(oldChildSnapshot) {
        var added_mood = oldChildSnapshot.val();
        var mood_key = oldChildSnapshot.key;
        $('li[data-mood-id="' + mood_key + '"]').remove();
      });
    } else {
      // User is signed out.
      // The start method will wait until the DOM is loaded.
      $('#ui-container').hide();
      ui.start('#firebaseui-auth-container', uiConfig);

    }
  }, function(error) {
    console.log(error);
  });
};

function ShowAutoSave() {
  $('#autosave-container').html('<span class="pulse">Saving...</span>');
  setTimeout(function(){
    $('#autosave-container').html('Saved');
  }, 2000);
}

function SaveMood() {
  ShowAutoSave();

  if (!hasSaved) {
    currentMoodKey = firebase.database().ref().child('users/' + currentUser.uid + '/moods/').push().key;
    var moodId = CreateID();
    hasSaved = true;
  }

  var moodData = {
    mood_title: document.getElementById('mood-title-input').textContent,
    track_url: document.getElementById("trackTitle").firstChild.getAttribute('href'),
    gpm: document.getElementById('gpmRangeEditor').value,
    timeline: visuals,
    visuals_by: currentUser.displayName,
    sounds_by: document.getElementById('trackCreator').textContent,
    duration: msDuration,
    track_art: document.getElementById("trackArt").firstChild.getAttribute('src')
  };

  if (moodData.timeline == {}) {
    moodData.timeline = {0: "double click to delete"};
  }
  
  var updates = {};
  updates['public_moods/' + currentMoodKey] = moodData;
  updates['users/' + currentUser.uid + '/moods/' + currentMoodKey] = moodData;

  firebase.database().ref().update(updates);
  console.log("saving mood");
}

$('#user-moods-list').on('click', '.delete-user-mood', function() {
  var keyToDelete = $(this).data('mood-id');
  var moodRef = firebase.database().ref('/users/' + currentUser.uid + '/moods/' + keyToDelete);
  var publicMoodRef = firebase.database().ref('/public_moods/' + keyToDelete);
  moodRef.remove();
  publicMoodRef.remove();
});

$('#user-moods-list').on('click', '.edit-user-mood', function() {
  ClearVisuals();
  currentMoodKey = $(this).data('mood-id');
  var moodRef = firebase.database().ref('/users/' + currentUser.uid + '/moods/');
  OpenEditor();
  ToggleUI();

  moodRef.once('value').then(function(snapshot) {
    var moodObj = snapshot.val();
    visuals = moodObj[currentMoodKey].timeline;
    FetchTrackForEditor(moodObj[currentMoodKey].track_url, 'edit mood', moodObj[currentMoodKey].timeline);

    for (x in visuals) {
      $(pips).append(pipHtmlPre + msToPercent(x, moodObj[currentMoodKey].duration) + '%;" data-millis="' + x + '" title="' + visuals[x] + '">' + visuals[x] + '</div>');
      CreateDraggable();
    }
    $('#mood-title-input').text(moodObj[currentMoodKey].mood_title);
    gpm = moodObj[currentMoodKey].gpm;
    $('#gpmRangeEditor').val(moodObj[currentMoodKey].gpm);
    $('.gpm-readout').html(UpdateGPMReadout(moodObj[currentMoodKey].gpm));
    hasSaved = true;
  });
});

// window.addEventListener('load', function() {
//   initApp();
// });

function SignOut(){
	firebase.auth().signOut().then(function() {
  		console.log('Signed Out');
      window.location.replace('index.html');
	}, function(error) {
  		console.error('Sign Out Error', error);
	});
}

function GetUserMoods() {
	ref.on("value", function(snapshot) {
	   console.log(snapshot.val());
	}, function (error) {
	   console.log("Error: " + error.code);
	});
}

//create unique ID for moods
function CreateID() {
  return Math.random().toString(36).substr(2, 9);
};

$('ul').on('click', '.get-short-link', function() {

  $('.toast').text('Link copied').addClass('show-toast');
  setTimeout(function(){
    $('.toast').text('Link copied').removeClass('show-toast');
  }, 2000);
  // $.ajax({
  //   url: 'https://api-ssl.bitly.com/v3/shorten?access_token=01caf534d23ad99787f4582c6b0d230b8d5c3f5e&longUrl=http%3A%2F%2Fthegif.club%2F?mood=' + key + '&format=txt',
  //   type: 'GET',
  //   success: function(data) {
  //     console.log(data);
  //     $(el).text(data);
  //   }
  // });
});