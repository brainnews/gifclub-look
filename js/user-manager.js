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
      	document.getElementById('welcome-message').innerHTML = 'Your moods <button class="btn btn-new-mood editor-button">create new mood</button> <span class="float-right">Signed in as ' + displayName + ' – <a href="#" id="sign-out">Sign out</a>';

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
        $('#user-moods-list').prepend('<li data-mood-id="' + mood_key + '" class="list-inline-item text-center user-mood-thumb"><div class="dropdown"><i id="dLabel" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="fa fa-ellipsis-h" aria-hidden="true"></i><div class="dropdown-menu" aria-labelledby="dLabel"><ul class="list-unstyled"><li class="edit-user-mood" data-mood-id="' + mood_key + '">Edit mood</li><li class="delete-user-mood" data-mood-id="' + mood_key + '">Delete mood</li></ul></div></div><img data-mood-id="' + mood_key + '" class="mb-6 mood-thumb" src="' + added_mood.track_art + '"><p class="text-truncate">' + added_mood.mood_title + '</p></li>');

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
      ui.start('#firebaseui-auth-container', uiConfig);
      document.getElementById('welcome-message').innerHTML = '<span class="text-center">Sign in to view moods created with the GIFClub editor.<br/>(desktop only)</span>';
      $('#user-moods-list').html('');
    }
  }, function(error) {
    console.log(error);
  });
};

// function saveMood(user_id, visuals_by) {
//   var editorIsOpen = $('#editor').hasClass('editor-open');
//   var newMoodKey = null;
//   var newMoodRef = null;

//   if (editorIsOpen) {
//     if (!hasSaved) {
//       var moodsListRef = firebase.database().ref('users/' + user_id + '/moods/');
//       newMoodRef = moodsListRef.push();
//       newMoodKey = moodsListRef.push().key;

//       newMoodRef.set({
//         mood_title: document.getElementById('mood-title-input').textContent,
//         track_url: document.getElementById("trackTitle").firstChild.getAttribute('href'),
//         gpm: document.getElementById('mood-gpm-input').textContent,
//         timeline: visuals,
//         visuals_by: visuals_by,
//         sounds_by: document.getElementById('trackCreator').textContent,
//         duration: msDuration,
//         track_art: document.getElementById("trackArt").firstChild.getAttribute('src')
//       });
//       hasSaved = true;
//     } else {
//       newMoodRef.update({
//         mood_title: document.getElementById('mood-title-input').textContent,
//         gpm: document.getElementById('mood-gpm-input').textContent,
//         timeline: visuals
//       });
//     }
//   }
// }

function ShowAutoSave() {
  $('#autosave-container').html('<span class="pulse">Saving...</span>');
  setTimeout(function(){
    $('#autosave-container').html('Saved');
  }, 2000);
}

function SaveMood() {
  ShowAutoSave();
  var moodData = {
    mood_title: document.getElementById('mood-title-input').textContent,
    track_url: document.getElementById("trackTitle").firstChild.getAttribute('href'),
    gpm: document.getElementById('mood-gpm-input').textContent,
    timeline: visuals,
    visuals_by: currentUser.displayName,
    sounds_by: document.getElementById('trackCreator').textContent,
    duration: msDuration,
    track_art: document.getElementById("trackArt").firstChild.getAttribute('src')
  };

  if (!hasSaved) {
    currentMoodKey = firebase.database().ref().child('users/' + currentUser.uid + '/moods/').push().key;
    hasSaved = true;
  }
  
  var updates = {};
  updates['users/' + currentUser.uid + '/moods/' + currentMoodKey] = moodData;

  firebase.database().ref().update(updates);
  console.log("saving mood");
}

$('#user-moods-list').on('click', '.delete-user-mood', function() {
  var keyToDelete = $(this).data('mood-id');
  var moodRef = firebase.database().ref('/users/' + currentUser.uid + '/moods/' + keyToDelete);
  moodRef.remove()
    .then(function() {
      console.log("Remove succeeded.")
    })
    .catch(function(error) {
      console.log("Remove failed: " + error.message)
    });
});

$('#user-moods-list').on('click', '.edit-user-mood', function() {
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

    hasSaved = true;
    $('#mood-title-input').text(moodObj[currentMoodKey].mood_title);
    $('#mood-gpm-input').text(moodObj[currentMoodKey].gpm);
  });
});

window.addEventListener('load', function() {
  initApp()
});

function SignOut(){
	firebase.auth().signOut().then(function() {
  		console.log('Signed Out');
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
var ID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
};