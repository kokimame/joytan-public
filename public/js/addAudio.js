function addPlayer(wavRef, targetId, script, projectName) {
  wavRef.getMetadata().then((data) => {
    var date = data["timeCreated"].slice(0, 10);
    var path = data["fullPath"];
    var playerId = "".concat("player_", path);
    var btnId = "".concat("btn_", path);
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
          <i id="${btnId}" class="fa fa-play ml-2" style="font-size: 30px; width: 20px; padding-left: 4px;"></i>
        </td>
        <td>
          <div class="card-body text-center">
            <h5>${script}</h5>
            <audio id="${playerId}" preload="true" type="audio/wav">
                <source src="${url}">
            </audio>
            <form class="${voteClass}" style="display: inline-block;">
              <label><input type="radio" name="vote" value="okay"> OK  </label>
              <label><input type="radio" name="vote" value="wrong"> Wrong  </label>
              <label><input type="radio" name="vote" value="unclear"> Unclear  </label>
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
        document.getElementById(btnId).className = "fa fa-play ml-2"
      })
      
      document.getElementById(btnId).addEventListener('click', () => {
        var player = document.getElementById(playerId)
        var button = document.getElementById(btnId)

        if (player.paused) {
          player.play()
          button.className = "fa fa-pause ml-2"
        } else if (!player.paused) {
          player.pause()
          button.className = "fa fa-play ml-2"
        }
      }) 
    })
  })
}

function getVotes(voteClass) {
  const voteForms = document.getElementsByClassName(voteClass);
  for (var i = 0; i < voteForms.length; i++) {
    console.log(voteForms[i]['vote'].value)
  }
}

function removeAllPlayers(audioId) {
  const node = document.getElementById(audioId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
