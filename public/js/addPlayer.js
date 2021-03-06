function addPlayer(voiceId, entryData, targetId) {
  const playerId = "player_" + voiceId;
  const playBtnId = "playBtn_" + voiceId;
  const projectName = entryData["project"];
  const entryId = entryData["entry_id"];
  // const date = entryData["created_at"].toDate()
  const autoBtnId = "auto_" + projectName;
  const spinId = "spin_" + projectName;
  const controlId = "control_" + projectName;
  const likeId = "like_" + voiceId;
  const likeCountId = "likeCount_" + voiceId;
  const mediaLinkId = "mediaLink_" + voiceId;

  const storage = firebase.storage();
  const voiceRef = storage.ref().child(`n_d_voice/${projectName}/n_d_${voiceId}.wav`);

  voiceRef.getDownloadURL().then(url => {
    // Add extra assertion to prevent failed loadings
    var upnString = entryData["upn"];
    var lonString = entryData["lon"];
    var displayName = entryData["username"];
    var mediaLink = entryData["user_link"];

    mainString = entryData["main_script"];
    upnString = (typeof upnString === 'undefined') ? "" : upnString;
    lonString = (typeof lonString === 'undefined') ? "" : lonString;

    const div = document.createElement('div');
    div.className = `player-table ${entryId}`;
    div.innerHTML = `
    <table class="bordered base-table">
      <td class="control-cell" style="position: relative; height: 65px">
        <span class="hole"></span>
        <span class="like grow" id="${likeId}" style="white-space: nowrap;">
          <i class="fa fa-arrow-up" aria-hidden="true"></i>
           <span id="${likeCountId}"></span>
        </span>
        <table>
          <tr>
            <td style="background: #deebe0; text-align: center;
             padding-left: 6px; padding-right: 6px">
              <i id="${playBtnId}" class="fa fa-play"></i>
            </td>
          </tr>
        </table>
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
        <div>
        <span id="${mediaLinkId}"></span>
        <div>
      </td>
    </table>
    `;
    var sameEntries = document.getElementsByClassName(entryId)
    if (sameEntries.length != 0) {
      $(`.player-table.${entryId}`).after(div)
    } else {
      // If this voice recording is not duplicated entry, append to the last
      document.getElementById(targetId).appendChild(div);
    }
    // Hide loader
    $("#" + spinId).addClass("hide-loader");
    $(`#${likeCountId}`).text(entryData['vote_like'])
    document.getElementById(controlId).style.display = "block";

    var likedArray = window.userData[`vote_${projectName}`]
    if (typeof likedArray !== 'undefined' && likedArray.includes(voiceId)) {
      $(`#${likeId}`).addClass('active-thumb')
    }

    if (mediaLink) {
      if (mediaLink.startsWith("tw::")) {
        var twitterUid = mediaLink.slice(4)
        var userLink = $("<a />", {
          href : "https://twitter.com/i/user/" + twitterUid,
          html : '<i class="fab fa-twitter"></i>' + replaceWithDots(displayName),
          target : "__blank",
          class : "media-link"
        })
      } else if (mediaLink.startsWith("fb::")) {
        var userLink = $("<a />", {
          href : "https://www.facebook.com/search/people/?q=" + displayName,
          html : ' <i class="fab fa-facebook"></i>' + replaceWithDots(displayName),
          target : "__blank",
          class : "media-link"
        })
      }
      $(`#${mediaLinkId}`).html(userLink)
    }

    $(`#${likeId}`).on('click', function() {
      event.preventDefault();
      var likeCount = parseInt($(`#${likeCountId}`).text())
      if($(this).hasClass('active-thumb')) {
        $(this).removeClass('active-thumb')
        
        updateLike(-1, projectName, voiceId, entryId)
        $(`#${likeCountId}`).text(likeCount - 1)
      } else {
        $(this).addClass('active-thumb');
        updateLike(1, projectName, voiceId, entryId)
        $(`#${likeCountId}`).text(likeCount + 1)
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

function replaceWithDots(name) {
  var newName = name
  const cutoffAt = 6
  if (newName.length > cutoffAt) {
    newName = newName.slice(0, cutoffAt) + '..'
  }
  return newName
}

function updateLike(sign, projectName, voiceId, entryId) {
  const increment = firebase.firestore.FieldValue.increment(sign);

  const user = firebase.auth().currentUser;
  const db = firebase.firestore()
  const voiceRef = db.collection(`projects/${projectName}/voice`).doc(voiceId);
  const projectRef = db.collection('projects').doc(projectName);

  db.runTransaction(trans => {
    return trans.get(voiceRef).then(voiceDoc => {
      var projectDoc = {}
        // Update the array of voted entry in the project document
      const votedEntryOp = sign === 1 ? firebase.firestore.FieldValue.arrayUnion(entryId) 
                                    : firebase.firestore.FieldValue.arrayRemove(entryId)
      const likeCount = voiceDoc.data().vote_like;
      console.log(voiceDoc.data())
      projectDoc["voted"] = votedEntryOp
      // For first/last like, apply operation to voted entries
      if (likeCount == 0 || likeCount == 1) {
        trans.update(projectRef, projectDoc)
      }
      var newVoiceDoc = {}
      newVoiceDoc['vote_like'] = increment
      trans.update(voiceRef, newVoiceDoc)

      if (user) {
        // const userVoiceRef = db.collection(`users/${user.uid}/vote_${projectName}`).doc(voiceId)
        const userRef = db.collection('users').doc(user.uid)
        const targetField = 'vote_' + projectName
        var userDoc = {}
        const userLikeOp = sign === 1 ? firebase.firestore.FieldValue.arrayUnion(voiceId) 
                                      : firebase.firestore.FieldValue.arrayRemove(voiceId)
        userDoc[targetField] = userLikeOp
        trans.set(userRef, userDoc, { merge : true })
      }
    });
  })
}

function removeAllPlayers(audioId) {
  const node = document.getElementById(audioId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
