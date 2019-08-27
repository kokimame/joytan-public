function addProjectBtn(item, projectRef) {
  const div = document.createElement('div');
  const btnId = "".concat("btn_", item["dirname"])
  const cardId = "".concat("card_", item["dirname"])
  const loadId = "".concat("load_", item["dirname"])
  const titleId = "".concat("title_", item["dirname"])
  var titleFixed = item["flags"] + item["title"]
  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <p>
    <button class="btn btn-outline-dark btn-block" type="button" data-toggle="collapse" data-target="#${item["dirname"]}" aria-expanded="false">
      <div class"btn-title" id="${titleId}">
        ${titleFixed} 0
      </div>
    </button>
  <div class="collapse" id="${item["dirname"]}">
    <div class="card card-body" id="${cardId}">
      <div id="${loadId}">
        <p>
          <button type="button" class="btn btn-success" id="${btnId}">Load audio</button>
        </p>
      </div>
    </div>
  </div>
  </p>
  `;
  document.getElementById('projects_top').appendChild(div);
  document.getElementById(loadId).addEventListener("click", function() {
    loadAudioBtn(projectRef, cardId)
  })

  projectRef.listAll().then(res => {
    var fileCount = 0;
    var titleDiv = document.getElementById(titleId)
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        fileCount += res.prefixes.length;
        titleDiv.innerHTML = [titleFixed, fileCount.toString()].join(' ');
      })
    })
  })
}

function loadAudioBtn(projectRef, targetId) {
  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {
            res.prefixes.forEach(userRef => {
              userRef.listAll().then(res => {
                res.items.forEach(wavRef => {
                  addAudioPlayer(wavRef, targetId)
                })
              })
            })    
          })
        })
      })
    })
  })
}