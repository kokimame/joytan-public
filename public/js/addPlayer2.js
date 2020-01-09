function addPlayer2(voiceId, entryData, targetId) {
  const playerId = "player_" + voiceId;
  const playBtnId = "playBtn_" + voiceId;
  const projectName = entryData["project"];
  const entryId = entryData["entry_id"];
  // const date = entryData["created_at"].toDate()
  const autoBtnId = "auto_" + projectName;
  const spinId = "spin_" + projectName;
  const controlId = "control_" + projectName;
  const voteBtnId = "voteBtn_" + projectName;
  const likeId = "like_" + voiceId;
  const dislikeId = "dislike_" + voiceId;
  const voteId = "vote_" + voiceId;
  const mediaLinkId = "mediaLink_" + voiceId;
  const voteClass = "vote_" + projectName;

  const storage = firebase.storage();
  const voiceRef = storage.ref().child(`voice/${projectName}/n_d_${voiceId}.wav`);

  voiceRef.getDownloadURL().then((url) => {
    console.log("userData..." , window.userData)
    // Add extra assertion to prevent failed loadings
    var upnString = entryData["upn"];
    var lonString = entryData["lon"];
    var displayName = entryData["username"];
    var mediaLink = entryData["user_link"];

    mainString = entryData["main_script"];
    upnString = (typeof upnString === 'undefined') ? "" : upnString;
    lonString = (typeof lonString === 'undefined') ? "" : lonString;
    color = "#D0D0D0"; // Light gray by default;

    // if (doneLookup[projectName].indexOf(index) != -1) {
    //   color = "#cefdde";
    // } else if (votedLookup[projectName].indexOf(index) != -1) {
    //   color = "#fff1cc"
    // }
    const div = document.createElement('div');
    div.className = 'player-table';
    div.innerHTML = `
    <table class="bordered" style="background: ${color};">
      <td style="text-align: center">
        <i id="${playBtnId}" class="fa fa-play ml-2"></i><br />
        <div style="overflow: hidden">
        <div class="like grow" id="${likeId}" value="like">
          <i class="fa fa-thumbs-o-up like" aria-hidden="true"></i>
        </div>
        <div class="dislike grow" id="${dislikeId}" value="dislike">
          <i class="fa fa-thumbs-o-up dislike" aria-hidden="true"></i>
        </div>
        </div>
      </td>
      <td>
        <div class="card-body text-center">
          <h1 class="upper-note">${upnString}</h1>
          <p class="main-script">${mainString}</p>
          <h1 class="lower-note">${lonString}</h1>
          <audio class="card-player" id="${playerId}" preload="true" type="audio/wav">
              <source src="${url}">
          </audio>
        </div>
        <div id="${mediaLinkId}"></div>
      </td>
    </table>
    `;
    document.getElementById(targetId).appendChild(div);
    // Hide loader
    $("#" + spinId).addClass("hide-loader");
    document.getElementById(controlId).style.display = "block";
    document.getElementById(voteBtnId).style.display = "inline-block";

    likeOrDislike = window.userData[`vote_${projectName}`][voiceId]
    if (typeof likeOrDislike !== 'undefined') {
      if (likeOrDislike == "like") {
        $(`#${likeId}`).addClass('active-thumb')
      } else {
        $(`#${dislikeId}`).addClass('active-thumb')
      }
    }

    if (mediaLink) {
      if (mediaLink.startsWith("tw::")) {
        var twitterUid = mediaLink.slice(4)
        var newLink = $("<a />", {
          href : "https://twitter.com/i/user/" + twitterUid,
          html : "by " + displayName + ' <i class="fab fa-twitter"></i>',
          target : "__blank",
          class : "media-link"
        })
        $(`#${mediaLinkId}`).html(newLink)
      }
    }

    $(`#${likeId}, #${dislikeId}`).on('click', function() {
      event.preventDefault();
      const likeOrDislike = $(this).attr('value')
      if (likeOrDislike == 'like' && $(`#${dislikeId}`).hasClass('active-thumb')) {
        $(`#${dislikeId}`).removeClass('active-thumb')
        updateLikeOrDislike('dislike', -1, projectName, voiceId, entryId)
      } else if (likeOrDislike == 'dislike' && $(`#${likeId}`).hasClass('active-thumb')) {
        $(`#${likeId}`).removeClass('active-thumb')
        updateLikeOrDislike('like', -1, projectName, voiceId, entryId)
      }
      if($(this).hasClass('active-thumb')) {
        $(this).removeClass('active-thumb')
        updateLikeOrDislike(likeOrDislike, -1, projectName, voiceId, entryId)
      } else {
        $(this).addClass('active-thumb');
        updateLikeOrDislike(likeOrDislike, 1, projectName, voiceId, entryId)
      }
    });
  

    document.getElementById(playerId).addEventListener('pause', () => {
      var autoBtn = document.getElementById(autoBtnId)
      var audioDiv = document.getElementById(targetId)
      document.getElementById(playBtnId).classList.replace('fa-pause', 'fa-play')
      if (autoBtn.value == "on") {
        playNext(audioDiv, playBtnId, autoBtnId);
      }
    })
    
    document.getElementById(playBtnId).addEventListener('click', event => {
      var autoBtn = document.getElementById(autoBtnId)
      var player = document.getElementById(playerId)
      var playerBtn = document.getElementById(playBtnId)

      if (autoBtn.value == "on" && event['isTrusted'] && player.paused) {
        return
      }
      if (!player.paused) {
        // Pause audio if it's playing.
        if (autoBtn.value == "on") {
          // While auto-playing, the current player clicked to pause
          player.pause()
        } else {
          // Reload instead of pausing in the middle of audio
          player.load()
          playerBtn.classList.replace('fa-pause', 'fa-play')
        }
      } else {
        // Play audio if it's paused.
        player.play()
        playerBtn.classList.replace('fa-play', 'fa-pause')
      }
    })
  })
}

function updateLikeOrDislike(likeOrDislike, sign, projectName, voiceId, entryId) {
  const fieldName = 'vote_' + likeOrDislike
  const increment = firebase.firestore.FieldValue.increment(sign);
  const arrayOp = sign === 1 ? firebase.firestore.FieldValue.arrayUnion(entryId) 
                             : firebase.firestore.FieldValue.arrayRemove(entryId)
  const user = firebase.auth().currentUser;
  const db = firebase.firestore()
  const voiceRef = db.collection(`projects/${projectName}/voice`).doc(voiceId);
  const projectRef = db.collection('projects').doc(projectName);
  var recordingDoc = {}
  var projectDoc = {}
  var batch = db.batch();
  recordingDoc[fieldName] = increment
  projectDoc["voted"] = arrayOp
  batch.update(voiceRef, recordingDoc)
  if (likeOrDislike == "like") {
    batch.update(projectRef, projectDoc)
  }
  if (user) {
    // const userVoiceRef = db.collection(`users/${user.uid}/vote_${projectName}`).doc(voiceId)
    const userRef = db.collection('users').doc(user.uid)
    const targetField = 'vote_' + projectName
    var voteResult = {}
    voteResult[targetField] = {}
    voteResult[targetField][voiceId] = sign === 1 ? likeOrDislike 
                                      : firebase.firestore.FieldValue.delete()
    batch.set(userRef, voteResult, { merge : true })
  }
  batch.commit()
}

function getVotes(voteClass) {
  const voteForms = document.getElementsByClassName(voteClass);
  const user = firebase.auth().currentUser;
  for (var i = 0; i < voteForms.length; i++) {
    form = voteForms[i]
    // When something selected in the 3 choice...
    if (form["vote"].value) {
      vote = parseInt(form["vote"].value)
      // Store vote results in the AUDIO FILE-oriented way
      rtdbTarget = form.id.replace(/\.[^/.]+$/, "")
      rtdbTarget = rtdbTarget.replace("projects/", "votes/")
      writeVoteData(rtdbTarget, vote)
      if (user) {
        // Store vote results for the USER-oriented way
        writeUserVoteData(user, rtdbTarget, vote)
      }
    }
  }
}

function writeVoteData(target, vote) {
  var voteData = {
    vote: vote
  }
  var newKey = firebase.database().ref(target).push().key;
  var updates = {}
  updates[newKey] = voteData
  firebase.database().ref(target).update(updates)
}

function writeUserVoteData(user, target, vote) {
  var voteData = {
    vote: vote,
    ref: target
  }
  var newKey = firebase.database().ref("users").child(user.uid).child("votes").push().key;
  var updates = {}
  updates[newKey] = voteData
  firebase.database().ref("users").child(user.uid).child("votes").update(updates)
}

function removeAllPlayers(audioId) {
  const node = document.getElementById(audioId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
