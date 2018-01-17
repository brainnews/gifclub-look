var currentUserMoods = null;
var mood_id = null;

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
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;

      user.getIdToken().then(function(accessToken) {
      	document.getElementById('welcome-message').innerHTML = 'Your moods <span class="float-right">Signed in as ' + displayName + ' – <a href="#" id="sign-out">Sign out</a>';
        $("#sign-out").click(function(){
	  		  SignOut();
        });
      });

      $("#save-mood").click(function(){
        console.log("saving mood");
		    saveMood(uid, mood_id, displayName);
	    });

      //Get object of user's moods
	    var ref = firebase.database().ref('/users/' + uid + '/moods/');

      ref.on('child_added', function(childSnapshot, prevChildKey) {
        var added_mood = childSnapshot.val();
        var mood_key = childSnapshot.key;
        $('#user-moods-list').append('<li data-mood-id="' + mood_key + '" class="list-inline-item text-center user-mood-thumb"><div class="dropdown"><i id="dLabel" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="fa fa-ellipsis-h" aria-hidden="true"></i><div class="dropdown-menu" aria-labelledby="dLabel"><ul class="list-unstyled"><li class="edit-user-mood" data-mood-id="' + mood_key + '">Edit mood</li><li class="delete-user-mood" data-mood-id="' + mood_key + '">Delete mood</li></ul></div></div><img data-mood-id="' + mood_key + '" class="mb-6 mood-thumb" src="' + added_mood.track_art + '"><p class="text-truncate">' + added_mood.mood_title + '</p>');

        $('.mood-thumb').click(function(){
          visuals = {};
          var keyToPlay = $(this).data('mood-id');
          
          ref.once('value').then(function(snapshot) {
            var moodObj = snapshot.val();
            console.log(moodObj[keyToPlay].mood_title);

            if(editorLoaded) {
              ClearEditorTrack();
            }

            LoadSoundToWidget(moodObj[keyToPlay].track_url, moodObj[keyToPlay].timeline, moodObj[keyToPlay].gpm);

            StartVisuals();
            ToggleUI();
          });
        });

        $('.delete-user-mood').click(function(){
          var keyToDelete = $(this).data('mood-id');
          var moodRef = firebase.database().ref('/users/' + uid + '/moods/' + keyToDelete);
          moodRef.remove()
            .then(function() {
              console.log("Remove succeeded.")
            })
            .catch(function(error) {
              console.log("Remove failed: " + error.message)
            });
        });

        $('.edit-user-mood').click(function(){

        });
      });

      ref.on('child_removed', function(oldChildSnapshot) {
        var added_mood = oldChildSnapshot.val();
        var mood_key = oldChildSnapshot.key;
        console.log("deleting: " + mood_key);
        var nodeToRemove = $('#user-moods-list').find('li').data('mood-id', mood_key);
        console.log(nodeToRemove);

        //$(nodeToRemove).remove();
      });

    // 	ref.on("value", function(snapshot) {
	   // 		//console.log(snapshot.val());
	   // 		var user_moods = snapshot.val();
	   		
	   // 		for (x in user_moods) {
    //       $('#user-moods-list').append('<li data-mood-id="' + x + '" class="list-inline-item text-center"><img class="mood-thumb mb-6" src="' + user_moods[x].track_art + '"><p class="text-truncate">' + user_moods[x].mood_title + '</p>');
   	// 	  }

    //   ref.off("value");

  		// }, function (error) { console.log("Error: " + error.code); });
    } else {
      // User is signed out.
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
      document.getElementById('welcome-message').innerHTML = 'Signed in below to save moods created with the GIFClub editor.';
    }
  }, function(error) {
    console.log(error);
  });
};

function saveMood(user_id, mood_id, visuals_by) {
  var moodsListRef = firebase.database().ref('users/' + user_id + '/moods/');
  var newMoodRef = moodsListRef.push();
  newMoodRef.set({
    mood_title: document.getElementById('mood-title-input').textContent,
    track_url: document.getElementById("trackTitle").firstChild.getAttribute('href'),
    gpm: document.getElementById('mood-gpm-input').textContent,
    timeline: visuals,
    visuals_by: visuals_by,
    sounds_by: document.getElementById('trackCreator').textContent,
    duration: msDuration,
    track_art: document.getElementById("trackArt").firstChild.getAttribute('src')
  });
}

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