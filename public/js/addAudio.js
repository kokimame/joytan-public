function addAudioPlayer(wavRef, targetId, script) {
  wavRef.getMetadata().then((data) => {
    var date = data["timeCreated"].slice(0, 10)
    var path = data["fullPath"]
    wavRef.getDownloadURL().then((url) => {
      const div = document.createElement('div');
      div.className = 'row';
      div.innerHTML = `
      <table>
        <col width="90px" />
        <tr>
          <td><font size="2">${date}</font></td>
          <td>${script}</td>
        </tr>
        <tr>
          <td></td>
          <td>
          <audio controls>
            <source src="${url}" type="audio/wav">
            Your browser does not support the audio element.
          </audio>
          </td>
        </tr>
        <tr>
        <td></td>
        <td>
          <form>
            <input type="radio" name="review" value="okay"> OK  
            <input type="radio" name="review" value="wrong"> Wrong  
            <input type="radio" name="review" value="unclear"> Unclear  
          </form>
        </td>
      </tr>
      </table>
      `;
      document.getElementById(targetId).appendChild(div);
    })
  })
}

function removeAudioPlayers(targetId) {
  const node = document.getElementById(targetId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
