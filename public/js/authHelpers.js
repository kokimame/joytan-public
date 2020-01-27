function validatePassword(){
    var pswInput = document.getElementById("signup-psw");
    var confirmPswInput = document.getElementById("confirm-password");
    if(pswInput.value != confirmPswInput.value) {
      confirmPswInput.setCustomValidity("Passwords Don't Match");
      return false;
    } else {
      confirmPswInput.setCustomValidity('');
      return true;
    }
  }

  function createNewUser() {
    var emailInput = document.getElementById("signup-email");
    var pswInput = document.getElementById("signup-psw");
    var unameInput = document.getElementById("signup-uname");

    // MAYBE Need a fix because this is NOT called on actual submit.
    if (!emailInput.checkValidity() ||
        !pswInput.checkValidity() ||
        !unameInput.checkValidity() ||
        !validatePassword()) {
      return
    }

    //Create User with Email and Password
    firebase.auth().createUserWithEmailAndPassword(emailInput.value, pswInput.value).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      throw error;
    }).then(userData => {
      console.log("Created new User! =>", userData)
      userData['user'].updateProfile({
        displayName: unameInput.value
      })
      closeModals();
    });
  }
function loginUser() {
  var password = $("#login-psw").val()
  var email = $("#login-email").val()
  //Sign In User with Email and Password
  firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      throw error;
  }).then(user => {
      console.log("Log in an user! =>", user)
      closeModals();
  });
}
function signOutUser() {
  firebase.auth().signOut().then(function() {
      // Sign-out successful.
      console.log('User Logged Out!');
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
      document.getElementById("account-modal").style.display = "block"
      document.getElementById("firebaseui-auth-container").style.display = "none"
  } else {
    document.getElementById("account-modal").style.display = "none"
    document.getElementById("firebaseui-auth-container").style.display = "block"
    // FirebaseUI config.
    var uiConfig = {
      signInSuccessUrl: 'http://localhost:5000',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
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
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
  };
  document.getElementById("auth-form").style.display = "block";
}
function closeModals() {
  $("#auth-form").hide();
  $("#about-view").hide();
  $("#stats-view").hide();
  $("#quiz-view").hide();
}

function generateAccountPage(user) {
    var accountDiv = document.getElementById("account-modal");
    accountDiv.innerHTML = `
    <h2>Your Account</h2>
    <p>Thank you for your contribution!</p>
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
    <p>Your email address: <span class="bold-line">${user.email}</span></p>
    <p>Your total voice contribution: <span id="totalAudioCount" style="font-size: 30px;"><b></b></span></p>
    <p>Your total votes: <span id="totalVoteCount" style="font-size: 30px;"><b></b></span></p>
    <p>Our project is still in an early stage. Your participation and contribution mean a lot to us 😌🏖️.</p>

    <div class="clearfix">
      <center>
        <button class="btn btn-secondary" type="button" onclick="signOutUser()">Sign out</button>
      </center>
    </div>
    `
    firebase.database().ref("users").child(user.uid).child("audio").child("all").once('value').then(snapshot => {
      var totalVoteCount = 0
      if (snapshot.val()) {
        totalVoteCount = Object.keys(snapshot.val()).length
      }
      document.getElementById("totalAudioCount").innerText = totalVoteCount.toString()
    })
    firebase.database().ref("users").child(user.uid).child("votes").once('value').then(snapshot => {
      var totalVoteCount = 0
      if (snapshot.val()) {
        totalVoteCount = Object.keys(snapshot.val()).length
      }
      document.getElementById("totalVoteCount").innerText = totalVoteCount.toString()
    })

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
// Smarter way to change login/signup modal!
function signupLoginTransition(nextModal) {
  if (nextModal == "login") {
      document.getElementById('signup-modal').style.display='none';
      document.getElementById('login-modal').style.display='block';
      // Copy draft email/psw to the next modal
      var draftEmail = document.getElementById('signup-email').value;
      var draftPsw = document.getElementById('signup-psw').value;
      document.getElementById('login-email').value = draftEmail;
      document.getElementById('login-psw').value = draftPsw;
  } else if (nextModal == "signup") {
      document.getElementById('login-modal').style.display='none';
      document.getElementById('signup-modal').style.display='block';
  }
}