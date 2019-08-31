var fileCountLookup = {};
var openedStackLookup = {};


function addProjectBtn(item, projectRef) {
  const div = document.createElement('div');
  const btnId = "".concat("loadBtn_", item["dirname"])
  const formId = "".concat("form_", item["dirname"])
  const pickId = "".concat("pick_", item["dirname"])
  const popId = "".concat("pop_", item["dirname"])
  const cardId = "".concat("card_", item["dirname"])
  const audioId = "".concat("audio_", item["dirname"])
  const spinId = "".concat("spin_", item["dirname"])
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
  <br />
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
      <div id="${spinId}">
      <font size="2">BETA: If this spins too long, please re-open the project.</font>
        <div class="spinning">
        </div>
      </div>
      <div id="${formId}">
        <p>
          <button type="button" class="btn btn-success" id="${btnId}">Vote and next</button>
          <button tabindex="0" class="btn btn-info" role="button" data-toggle="popover" 
          data-trigger="focus" data-placement="bottom" data-style="mypops" id="${pickId}">Index</button>
          <div id="${popId}" style="display: none;">
          </div>
        </p>
      </div>
      <div id="${audioId}">
      </div>
    </div>
  </div>
  `;
  document.getElementById('projectsTop').appendChild(div);
  document.getElementById(popId).appendChild(setPopupItems(item));

  $("#" + pickId).popover({
    html: true,
    content: () => {
        return $('#' + popId).html();
    }
  });

  document.getElementById(titleId).addEventListener("click", () => {
    if (document.getElementById(item["dirname"]).className == "collapse") {
      loadAudioBtn(projectRef, audioId, item["entries"]);
      $("#" + spinId).removeClass("hide-loader");
      document.getElementById(formId).style = "display: none;"
    }
  })
  document.getElementById(btnId).addEventListener("click", () => {
    loadAudioBtn(projectRef, audioId, item["entries"]);
    $("#" + spinId).removeClass("hide-loader");
    document.getElementById(formId).style = "display: none;"
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

function setPopupItems(projectItem) {
  var ul = document.createElement('ul');
  var wantedKey = projectItem["wanted"]
  var entries = projectItem["entries"]
  ul.className = "popovermenu"

  ul.innerHTML += `
  <script type="text/javascript">
    function linkClicked(text) {
      console.log(text)
    }
  </script>
  `

  for(var i = 0; i < entries.length; i+=1) {
    ul.innerHTML += `<li class="popLink" onclick="linkClicked(this.innerText)"><a href="#">${i+1}</a></li>`
  }
  return ul
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
                    addAudioPlayer(wavRef, targetId, script, projectRef.name);
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