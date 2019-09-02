function addPlayer(wavRef, targetId, script, projectName) {
  wavRef.getMetadata().then((data) => {
    var date = data["timeCreated"].slice(0, 10);
    var path = data["fullPath"];
    var playerId = "".concat("player_", path);
    var btnId = "".concat("btn_", path);
    const spinId = "".concat("spin_", projectName)
    const formId = "".concat("form_", projectName)

    wavRef.getDownloadURL().then((url) => {
      const div = document.createElement('div');
      div.className = 'playerTable';
      div.innerHTML = `
      <table class="table">
      <audio id="${playerId}" src="${url}" type="audio/wav></audio>
        <col width="40px" />
        <tr>
          <td style="width: 20%"><font size="2">${date}</font></td>
          <td>${script}</td>
        </tr>
        <tr>
        <td>
        </td>
        <td>
          <button id="${btnId}"><i class="fa fa-play ml-2" style="font-size: 30px;"></i></button>
          <form style="display: inline-block;">
            <input type="radio" name="review" value="okay"> OK  
            <input type="radio" name="review" value="wrong"> Wrong  
            <input type="radio" name="review" value="unclear"> Unclear  
          </form>
        </td>
      </tr>
      </table>
      `;
 
      document.getElementById(targetId).appendChild(div);
      // Hide loader
      $("#" + spinId).addClass("hide-loader");
      document.getElementById(formId).style = "display: block";
 
      document.getElementById(playerId).addEventListener('ended', () => {
        document.getElementById(btnId).innerHTML = `<i class="fa fa-play ml-2" style="font-size: 30px;"></i>`
      })
      
      document.getElementById(btnId).addEventListener('click', () => {
        var player = document.getElementById(playerId)
        var button = document.getElementById(btnId)

        if (player.paused) {
          player.play()
          button.innerHTML = `<i class="fa fa-pause ml-2" style="font-size: 30px;"></i>`
        } else if (!player.paused) {
          player.pause()
          button.innerHTML = `<i class="fa fa-play ml-2" style="font-size: 30px;"></i>`
        }
      }) 
    })
  })
}

function removeAllPlayers(targetId) {
  const node = document.getElementById(targetId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
