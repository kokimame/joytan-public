function addProjectContent(item, wavRefs) {
  const div = document.createElement('div');
  const area_btn = "".concat("btn_", item["dirname"])
  const area_play = "".concat("play_", item["dirname"])
  if (typeof wavRefs === "undefined") {
    return null;
  }

  var size = 0;
  console.log(typeof wavRefs)

  console.log(item, wavRefs)
  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <p>
    <button class="btn btn-outline-dark btn-block" type="button" data-toggle="collapse" data-target="#${item["dirname"]}" aria-expanded="false">
      ${item["flags"]}${item["title"]}
    </button>
  <div class="collapse" id="${item["dirname"]}">
    <div class="card card-body" id="${area_play}">
    <p>
    Async problem:  Size ${size}
    </p>
    <p>
      <button type="button" class="btn btn-success" id="${area_btn}">Load audio</button>
    </p>
    </div>
  </div>
  </p>
  `;
  document.getElementById('project_contents').appendChild(div);
  document.getElementById(area_btn).addEventListener("click", function() {
    loadAudioBtn(wavRefs, area_play)
  })
}

function loadAudioBtn(wavRefs, targetId) {
  wavRefs.forEach(function(ref) {
    console.log(targetId)
    addAudioPlayer(ref, targetId)
  })
}
