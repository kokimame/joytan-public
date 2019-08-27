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
      <p>
        <button type="button" class="btn btn-success" id="${btnId}">>></button>
      </p>
      <div id="${loadId}">
      </div>
    </div>
  </div>
  </p>
  `;
  document.getElementById('projects_top').appendChild(div);
  document.getElementById(btnId).addEventListener("click", function() {
    loadAudioBtn(projectRef, loadId)
  })

  projectRef.listAll().then(res => {
    var fileCount = 0;
    var titleDiv = document.getElementById(titleId)
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        fileCount += res.prefixes.length;
        titleDiv.innerHTML = [titleFixed, fileCount.toString()].join(' ... ');
      })
    })
  })
}

var audioNumToShow = 4;
var openedStack = [];
function loadAudioBtn(projectRef, targetId) {
  var loadCount = 0;
  var isNewlyAdded = false;
  removeAudioPlayers(targetId);
  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {
            res.prefixes.forEach(userRef => {
              userRef.listAll().then(res => {
                console.log("opened stack ... ", openedStack.length, openedStack);
                for(var wavRef of res.items) {
                  if (loadCount >= audioNumToShow) {
                    console.log("Broke the for loop");
                    break;
                  }
                  if (wavRef.name.startsWith('n_d_') &&
                   !openedStack.includes(wavRef.fullPath) ) {
                    addAudioPlayer(wavRef, targetId);
                    openedStack.push(wavRef.fullPath);
                    loadCount += 1;
                    isNewlyAdded = true;
                  }
                }
                // Nothing newly added; openedStack is full and needs to reflesh
                if (!isNewlyAdded) {
                  console.log("Reflesh opened stack.");
                  openedStack = [];
                }
              })
            })    
          })
        })
      })
    })
  })
}