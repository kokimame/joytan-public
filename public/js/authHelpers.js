function signOutUser() {
  firebase.auth().signOut().then(function() {
      // Sign-out successful.
      console.log('User Logged Out!');
      location.reload();
      closeModals();
  }).catch(error => {
     // An error happened.
      console.log(error);
  });
}

function handleAuthButton() {
  var user = firebase.auth().currentUser;
  if (user) {
      generateAccountPage(user);
      $("#account-view").show()
  } else {
    // FirebaseUI config.
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return true;
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          // document.getElementById('loader').style.display = 'none';
        }
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: 'popup',
      // Redirect to current page
      signInSuccessUrl: location.href,
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      // tosUrl and privacyPolicyUrl accept either url string or a callback
      // function.
      // Terms of service url/callback.
      tosUrl: 'https://kokimame.github.io/joytan/privacy_policy_joytan_rec.html',
      // Privacy policy url/callback.
      privacyPolicyUrl: function() {
        window.location.assign('https://kokimame.github.io/joytan/privacy_policy_joytan_rec.html');
      }
    }
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
    $("#auth-view").show();
  };
}
function closeModals() {
  $("#auth-view").hide();
  $("#account-view").hide();
  $("#about-view").hide();
  $("#stats-view").hide();
  $("#quiz-view").hide();
  $("#ss-help-view").hide();
}

function generateAccountPage(user) {
    var accountDiv = document.getElementById("account-modal");
    accountDiv.innerHTML = `
    <h2>Your Account</h2>
    <p>This section is work in progress👷</p>
    <hr>
    <p>Your username: 
      <span id="uname-display" >
        <span id="current-uname" class="bold-line">${user.displayName}</span> 
        <i id="uname-edit-btn" class="fas fa-edit"></i>
      </span>
      <span id="uname-edit" style="display: none;">
        <input id="uname-input" value="${user.displayName}"></input>
        <button id="uname-edit-ok" 
          class="btn btn-success btn-slim">OK</button>
        <button id="uname-edit-cancel" 
          class="btn btn-secondary btn-slim">Cancel</button>
      </span>
    </p>
    <p id='user-email'>Your email address: <span class="bold-line">${user.email}</span></p>
    <p>Your total voice contribution: <span id="total-voice-count" style="font-size: 30px;"><b>0</b></span></p>
    <p>Our project is still in an early stage. Your participation and contribution mean a lot to us 😌🏖️.</p>

    <div class="clearfix">
      <center>
        <button class="btn btn-secondary" type="button" onclick="signOutUser()">Sign out</button>
      </center>
    </div>
    `
    var db = firebase.firestore()
    db.collection('users').doc(user.uid).get().then(doc => {
      var data = doc.data()
      if (typeof data != 'undefined' && 'voice' in data) {
        var totalVoiceCount = data['voice'].length
        $("#total-voice-count").text(totalVoiceCount)
      }
    })
    if (user.email == null) {
      $('#user-email').hide()
    }
    // firebase.database().ref("users").child(user.uid).child("votes").once('value').then(snapshot => {
    //   var totalVoteCount = 0
    //   if (snapshot.val()) {
    //     totalVoteCount = Object.keys(snapshot.val()).length
    //   }
    //   document.getElementById("totalVoteCount").innerText = totalVoteCount.toString()
    // })

    $("#uname-edit-btn").click(ev => {
      $("#uname-display").hide();
      $("#uname-edit").show();
    })
    $("#uname-edit-ok").click(ev => {
      var newName = $("#uname-input").val();
      user.updateProfile({
          displayName: newName
      }).then(() => {
          $("#current-uname").text(newName);
          $("#uname-edit").hide();
          $("#uname-display").show();
      })
  })
  $("#uname-edit-cancel").click(ev => {
      $("#uname-edit").hide();
      $("#uname-display").show();
  })
}