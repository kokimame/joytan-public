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
        <button type="button" class="btn btn-success" id="${btnId}">Vote and next</button>
        <select class="form-control" id="${pickId}" style="width: 100px; display: inline-block;">
        </select>
      </div>
      <br />
      <div id="${audioId}">
      </div>
    </div>
  </div>
  `;
  document.getElementById('projectsTop').appendChild(div);

  var availProg = document.getElementById(availProgId);
  var picker = document.getElementById(pickId);
  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {            
            fileCountLookup[item["dirname"]] += res.prefixes.length;
            availRatio = (100 * fileCountLookup[item["dirname"]] / totalEntries)
            availProg.style.width = availRatio.toString() + "%";
            if (availRatio > 10) {
              availProg.innerText = "Available";
            }
            var index = parseInt(entryRef.name, 10)
            picker.innerHTML += `<option value="${index}">${index}</option>`

            var selectList = $('#' + pickId + ' option');
            selectList.sort(function(a,b){
                return b.value - a.value;
            });
            $('#' + pickId).html(selectList);
          })
        })
      })
    })
  })

  document.getElementById(titleId).addEventListener("click", () => {
    if (picker.value > 0 && document.getElementById(item["dirname"]).className == "collapse") {
      keyRef = projectRef.child(("00000" + picker.value).slice(-5)).child(item["wanted"])
      loadAudioBtn(keyRef, audioId, item["entries"][picker.value - 1][item["wanted"]], item["dirname"]);
      $("#" + spinId).removeClass("hide-loader");
      document.getElementById(formId).style = "display: none;"
    }
  })
  document.getElementById(btnId).addEventListener("click", () => {
    keyRef = projectRef.child(("00000" + picker.value).slice(-5)).child(item["wanted"])
    loadAudioBtn(keyRef, audioId, item["entries"][picker.value - 1][item["wanted"]], item["dirname"]);
    $("#" + spinId).removeClass("hide-loader");
    document.getElementById(formId).style = "display: none;"
  })
}

function loadAudioBtn(kayRef, targetId, script, projectName) {
  var loadCount = 0;
  const audioNumToShow = 4;

  removeAudioPlayers(targetId);

  keyRef.listAll().then(res => {
    res.prefixes.forEach(userRef => {
      userRef.listAll().then(res => {
        for (var wavRef of res.items) {
          if (wavRef.name.startsWith('n_d_')) {
            addAudioPlayer(wavRef, targetId, script, projectName);
            loadCount += 1;
            isNewlyAdded = true;
          }
        }
      })
    })
  })
}