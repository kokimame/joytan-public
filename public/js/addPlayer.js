function addPlayer(wavRef, targetId, projectName) {
  wavRef.getMetadata().then((data) => {
    const date = data["timeCreated"].slice(0, 10);
    const path = data["fullPath"];
    const playerId = "".concat("player_", path);
    const playBtnId = "".concat("playBtn_", path);
    const autoBtnId = "".concat("auto_", projectName);
    const spinId = "".concat("spin_", projectName);
    const controlId = "".concat("control_", projectName);
    const voteBtnId = "".concat("voteBtn_", projectName);
    const voteClass = "".concat("vote_", projectName);

    wavRef.getDownloadURL().then((url) => {
      // Add extra assertion to prevent failed loadings
      var index = parseInt(wavRef.fullPath.split('/')[2])
      const div = document.createElement('div');
      div.className = 'player-table';
      div.innerHTML = `
      <table class="bordered" style="background: ${randomColor};">
        <td style="padding-bottom: 25px;">
          <font size="2" style="padding-left: 10px;">${index} </font><br />
          <i id="${playBtnId}" class="fa fa-play ml-2" style="font-size: 30px; width: 20px; padding-left: 4px;"></i>
        </td>
        <td>
          <div class="card-body text-center">
            <h5>${entries[index - 1][currentWanted]}</h5>
            <audio class="card-player" id="${playerId}" preload="true" type="audio/wav">
                <source src="${url}">
            </audio>
            <form class="${voteClass}" id="${path}" style="display: inline-block;">
              <label><input type="radio" name="vote" value="5"> OK  </label>
              <label><input type="radio" name="vote" value="1"> Wrong  </label>
              <label><input type="radio" name="vote" value="0"> Unclear  </label>
            </form>
            <p style="font-size: 10px;">${date}</p>
          </div>
        </td>
      </table>
      `;
 
      document.getElementById(targetId).appendChild(div);
      // Hide loader
      $("#" + spinId).addClass("hide-loader");
      document.getElementById(controlId).style = "display: block;";
      document.getElementById(voteBtnId).style = "display: inline-block;";
 
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
  })
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
