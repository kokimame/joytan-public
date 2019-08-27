function addAudioPlayer(wavRef, targetId) {
  wavRef.getMetadata().then(function(data) {
    var date = data["timeCreated"].slice(0, 10)
    var path = data["fullPath"]
    wavRef.getDownloadURL().then(function(url) {
      const div = document.createElement('div');
      div.className = 'row';
      div.innerHTML = `
      <p>"${date}, ${path}"</p>
      <audio controls>
        <source src="${url}" type="audio/wav">
      Your browser does not support the audio element.
      </audio>
      `;
      document.getElementById(targetId).appendChild(div);
    })
  })

}
