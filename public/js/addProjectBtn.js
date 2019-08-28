var fileCountLookup = {};
var openedStackLookup = {};


function addProjectBtn(item, projectRef) {
  const div = document.createElement('div');
  const btnId = "".concat("btn_", item["dirname"])
  const cardId = "".concat("card_", item["dirname"])
  const loadId = "".concat("load_", item["dirname"])
  const titleId = "".concat("title_", item["dirname"])
  const doneProgId = "".concat("done", titleId)
  const reviewProgId = "".concat("review", titleId)
  const availProgId = "".concat("avail", titleId)
  const totalEntries = item["entries"].length;
  var titleFixed = item["flags"] + item["title"]

  fileCountLookup[item["dirname"]] = 0;
  openedStackLookup[item["dirname"]] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <p>
    <button class="btn btn-outline-dark btn-block text-left" type="button" 
      data-toggle="collapse" data-target="#${item["dirname"]}" aria-expanded="false">
      <i class="fa fa-chevron-down pull-right"></i>
      <div class"btn-title" id="${titleId}">
          ${titleFixed}
      </div>
      
      <div class="progress">
        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
          role="progressbar" style="width: 0%; height: 100%" aria-valuenow="10" 
          aria-valuemin="0" aria-valuemax="100" id="${doneProgId}"></div>
        <div class="progress-bar" 
          role="progressbar" style="width: 0%; height: 90%" aria-valuenow="10" 
          aria-valuemin="0" aria-valuemax="100" id="${reviewProgId}"></div>
        <div class="progress-bar bg-info" role="progressbar" 
          style="width: 0%; height: 80%" aria-valuenow="30"
          aria-valuemin="0" aria-valuemax="100" id="${availProgId}"></div>
      </div>
    </button>
  <div class="collapse" id="${item["dirname"]}" data-parent="#projectsTop">
    <div class="card card-body" id="${cardId}">
      <p>
        <button type="button" class="btn btn-success" id="${btnId}">Vote and next</button>
      </p>
      <div id="${loadId}">
      </div>
    </div>
  </div>
  </p>
  `;

  document.getElementById('projectsTop').appendChild(div);
  document.getElementById(titleId).addEventListener("click", () => {
    if (document.getElementById(item["dirname"]).className == "collapse") {
      loadAudioBtn(projectRef, loadId, item["entries"]);
    }
  })
  document.getElementById(btnId).addEventListener("click", () => {
    loadAudioBtn(projectRef, loadId, item["entries"]);
  })

  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {
            var availProg = document.getElementById(availProgId);
            
            fileCountLookup[item["dirname"]] += res.prefixes.length;
            availRatio = (100 * fileCountLookup[item["dirname"]] / totalEntries)
            availProg.style.width = availRatio.toString() + "%";
            if (availRatio > 10) {
              availProg.innerText = "Available";
            }
          })
        })
      })
    })
  })
}

function loadAudioBtn(projectRef, targetId, entries) {
  var loadCount = 0;
  const audioNumToShow = 4;

  removeAudioPlayers(targetId);

  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {
            res.prefixes.forEach(userRef => {
              userRef.listAll().then(res => {
                if (openedStackLookup[projectRef.name].length
                  == fileCountLookup[projectRef.name]) {
                  openedStackLookup[projectRef.name] = [];
                }
                for (var wavRef of res.items) {
                  if (loadCount >= audioNumToShow) {
                    console.log("Skip the loop");
                    break;
                  }
                  if (wavRef.name.startsWith('n_d_') &&
                    !openedStackLookup[projectRef.name].includes(wavRef.fullPath)) {
                    var script = entries[parseInt(entryRef.name, 10) - 1][keyRef.name];
                    addAudioPlayer(wavRef, targetId, script);
                    openedStackLookup[projectRef.name].push(wavRef.fullPath);
                    loadCount += 1;
                    isNewlyAdded = true;
                  }
                }
              })
            })
          })
        })
      })
    })
  })
}