function addPlayer(wavRef, targetId, script, projectName) {
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
      const div = document.createElement('div');
      div.className = 'player-table';
      div.innerHTML = `
      <table class="bordered" style="background: ${randomColor};">
        <td style="padding-bottom: 25px;">
          <font size="2" style="padding-left: 10px;">${currentIndex + 1} </font><br />
          <i id="${playBtnId}" class="fa fa-play ml-2" style="font-size: 30px; width: 20px; padding-left: 4px;"></i>
        </td>
        <td>
          <div class="card-body text-center">
            <h5>${script}</h5>
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
 
      document.getElementById(playerId).addEventListener('ended', () => {
        var isAuto = document.getElementById(autoBtnId).value
        var audioDiv = document.getElementById(targetId)
        document.getElementById(playBtnId).className = "fa fa-play ml-2"

        if (isAuto == "on") {
          var isNextPlayed = playNext(audioDiv, playBtnId);
          if (!isNextPlayed) {
            // Turn off the auto playing if there is nothing to play anymore
            var autoBtn = document.getElementById(autoBtnId)
            autoBtn.value = "off"
            autoBtn.innerHTML = `Auto <a class="fa fa-volume-up">`
          }
        }
      })
      
      document.getElementById(playBtnId).addEventListener('click', (event) => {
        var isAuto = document.getElementById(autoBtnId).value
        if (isAuto == "on" && event['isTrusted']) {
          return
        }
        var player = document.getElementById(playerId)
        var button = document.getElementById(playBtnId)
        if (player.paused) {
          player.play()
          button.className = "fa fa-pause ml-2"
        } else if (!player.paused) {
          player.load()
          button.className = "fa fa-play ml-2"
        }
      }) 
    })
  })
}

function getVotes(voteClass) {
  const voteForms = document.getElementsByClassName(voteClass);
  for (var i = 0; i < voteForms.length; i++) {
    form = voteForms[i]
    // When something selected in the 3 choice...
    if (form["vote"].value) {
      vote = parseInt(form["vote"].value)
      database_target = form.id.replace(/\.[^/.]+$/, "")
      database_target = database_target.replace("projects/", "votes/")
      writeVoteData(database_target, vote)
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

function removeAllPlayers(audioId) {
  const node = document.getElementById(audioId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}