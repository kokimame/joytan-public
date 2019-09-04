var fileCountLookup = {};
var openedStackLookup = {};
var cardPallete = ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94",
                   "#ebf4f6", "#bdeaee", "#90cdd6", "#fff6e9", "#ffefd7", 
                   "#fffef9", "#e3f0ff", "#d2e7ff"];


function addProject(item, projectRef) {
  const div = document.createElement('div');
  const projectName = item["dirname"]
  const loadBtnId = "".concat("loadBtn_", projectName)
  const voteBtnId = "".concat("voteBtn_", projectName)
  const controlId = "".concat("control_", projectName)
  const voteClass = "".concat("vote_", projectName);
  const pickId = "".concat("pick_", projectName)
  const cardId = "".concat("card_", projectName)
  const audioId = "".concat("audio_", projectName)
  const spinId = "".concat("spin_", projectName)
  const titleId = "".concat("title_", projectName)
  const doneProgId = "".concat("done", titleId)
  const reviewProgId = "".concat("review", titleId)
  const availProgId = "".concat("avail", titleId)
  const totalEntries = item["entries"].length;
  var titleFixed = item["flags"] + item["title"]

  fileCountLookup[projectName] = 0;
  openedStackLookup[projectName] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <br />
    <button class="btn btn-outline-dark btn-block text-left" type="button" 
      data-toggle="collapse" data-target="#${projectName}" aria-expanded="false" id="${titleId}">
      <i class="fa fa-chevron-down pull-right"></i>
      <div class"btn-title" >
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
  <div class="collapse" id="${projectName}" data-parent="#projectsTop">
    <div class="card card-body" id="${cardId}">
      <div id="${spinId}">
        <div class="spinning">
        </div>
      </div>
      <div id="${controlId}">
        <button type="button" class="btn btn-success" id="${loadBtnId}">Load</button>
        <select class="form-control" id="${pickId}" style="width: 100px; display: inline-block;">
        </select>
        <button type="button" class="btn btn-success" id="${voteBtnId}" style="margin-left: 20px;">Vote and next</button>
      </div>
      <br />
      <div id="${audioId}">
      </div>
    </div>
  </div>
  `;
  // TODO: Audio auto-play
  document.getElementById('projectsTop').appendChild(div);

  var availProg = document.getElementById(availProgId);
  var picker = document.getElementById(pickId);
  var audioDiv = document.getElementById(audioId)

  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {            
            fileCountLookup[projectName] += res.prefixes.length;
            availRatio = (100 * fileCountLookup[projectName] / totalEntries)
            availProg.style.width = availRatio.toString() + "%";
            if (availRatio > 10) {
              availProg.innerText = "Available";
            }
            var index = parseInt(entryRef.name, 10)
            picker.innerHTML += `<option value="${index}" onchange="pickerIndexChanged()">${index}</option>`

            var selectList = $('#' + pickId + ' option');
            selectList.sort((a, b) => {
                return b.value - a.value;
            });
            $('#' + pickId).html(selectList);
          })
        })
      })
    })
  })

  function pickerIndexChanged() {
    // Can be usable in the functions called later as well!?
    keyRef = projectRef.child(("0000" + picker.value).slice(-5)).child(item["wanted"]);
    currentIndex = picker.value - 1;
    script = item["entries"][currentIndex][item["wanted"]];
    randomColor = cardPallete[Math.floor(Math.random() * cardPallete.length)];
    appendAudio(audioId, item["dirname"]);

    $("#" + spinId).removeClass("hide-loader");
    document.getElementById(controlId).style = "display: none;"
  }
  $('#' + pickId).change(() => {
    pickerIndexChanged();
  })

  document.getElementById(titleId).addEventListener("click", (e) => {
    if (picker.value <= 0) {
      // Stop when picker is NOT ready!
      // TODO: Probably there is a better way to do this.
      e.stopPropagation();
    } else if (audioDiv.innerHTML.trim() == "" && document.getElementById(projectName).className == "collapse") {
      // MAYBE: To prevent double loading which induce the unplayable player error
      removeAllPlayers(audioId)
      pickerIndexChanged();
    }
  })
  document.getElementById(loadBtnId).addEventListener("click", () => {
    picker.selectedIndex -= 1;
    if (picker.selectedIndex < 0) {
      picker.selectedIndex = picker.length - 1;
    }
    pickerIndexChanged();
  })
  document.getElementById(voteBtnId).addEventListener("click", () => {
    getVotes(voteClass);
    removeAllPlayers(audioId);

    picker.selectedIndex -= 1;
    if (picker.selectedIndex < 0) {
      picker.selectedIndex = picker.length - 1;
    }
    pickerIndexChanged();
  })
}

function appendAudio(idToAppend, projectName) {  
  keyRef.listAll().then(res => {
    res.prefixes.forEach(userRef => {
      userRef.listAll().then(res => {
        for (var wavRef of res.items) {
          if (wavRef.name.startsWith('n_d_')) {
            addPlayer(wavRef, idToAppend, script, projectName);
          }
        }
      })
    })
  })
}