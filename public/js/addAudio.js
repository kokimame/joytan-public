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
      <table class="bordered">
      <td>
        <i id="${btnId}" class="fa fa-play ml-2" style="font-size: 30px; width: 40px;"></i>
      </td>
      <td>
        <div class="card-body text-center" style="display: inline-block;">
          <h5>${script}</h5>
          <audio id="${playerId}" preload="true" type="audio/wav">
              <source src="${url}">
          </audio>
          <form style="display: inline-block;">
            <input type="radio" name="review" value="okay"> OK  
            <input type="radio" name="review" value="wrong"> Wrong  
            <input type="radio" name="review" value="unclear"> Unclear  
          </form>
          <p style="font-size: 10px;">${date}</p>
        </div>
      </td>
    </table>
      `;
 
      document.getElementById(targetId).appendChild(div);
      // Hide loader
      $("#" + spinId).addClass("hide-loader");
      document.getElementById(formId).style = "display: block";
 
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

function removeAllPlayers(targetId) {
  const node = document.getElementById(targetId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
