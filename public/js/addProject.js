var fileCountLookup = {};
var votedLookup = {};
var doneLookup = {};
var openIndexLookup = {};
var cardPallete = ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94",
                   "#ebf4f6", "#bdeaee", "#90cdd6", "#fff6e9", "#ffefd7", 
                   "#fffef9", "#e3f0ff", "#d2e7ff"];
const moreThanWarning = "You are reviewing more than 50 entires. Please VOTE first and load audio :)"


function addProject(item, projectRef) {
  const div = document.createElement('div');
  const projectName = item["dirname"]
  const loadBtnId = "".concat("loadBtn_", projectName)
  const voteBtnId = "".concat("voteBtn_", projectName)
  const controlId = "".concat("control_", projectName)
  const autoBtnId = "".concat("auto_", projectName)
  const voteClass = "".concat("vote_", projectName);
  const customSelectId = "".concat("cSelect_", projectName)
  const baseSelectId = "".concat("bSelect_", projectName)
  const selectableId = "".concat("selectable_", projectName)
  const selectedId = "".concat("selected_", projectName)
  const cardId = "".concat("card_", projectName)
  const audioId = "".concat("audio_", projectName)
  const spinId = "".concat("spin_", projectName)
  const titleId = "".concat("title_", projectName)
  const doneProgId = "".concat("done_", titleId)
  const reviewProgId = "".concat("review_", titleId)
  const availProgId = "".concat("avail_", titleId)
  const totalEntries = item["entries"].length;
  var titleFixed = item["flags"] + item["title"]

  fileCountLookup[projectName] = 0;
  openIndexLookup[projectName] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <br />
    <button class="btn btn-outline-dark btn-block text-left collapsed" type="button" 
      data-toggle="collapse" data-target="#${projectName}" aria-expanded="false" id="${titleId}">
      <i class="fa fa-chevron-down pull-right"></i>
      <div class"btn-title" >
          ${titleFixed}
      </div>
      
      <div class="progress">
        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
          role="progressbar" style="width: 0%; height: 100%" aria-valuenow="10" 
          aria-valuemin="0" aria-valuemax="100" id="${doneProgId}"></div>
        <div class="progress-bar bg-warning" 
          role="progressbar" style="width: 0%; height: 90%;" aria-valuenow="10" 
          aria-valuemin="0" aria-valuemax="100" id="${reviewProgId}"></div>
        <div class="progress-bar bg-info" role="progressbar" 
          style="width: 0%; height: 80%;" aria-valuenow="30"
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
        <button type="button" class="btn btn-slim btn-success" id="${loadBtnId}">Load</button>
        <div class="custom-select" id="${customSelectId}">
          <select class="form-control" id="${baseSelectId}">
          </select>
        </div>
        <button type="button" class="btn btn-slim btn-success auto-play" id="${autoBtnId}" value="off">Auto <a class="fa fa-volume-up"></a></button>
      </div>
      <hr style="margin-bottom: 12px;" />
      <div id="${audioId}" style="display: inline-block;">
      </div>
      <button type="button" id="${voteBtnId}" class="btn btn-slim btn-secondary btn-vote"
        style="display: inline-block;">Vote & Next</button>
    </div>
  </div>
  `;
  // TODO: Audio auto-play
  document.getElementById('projectsTop').appendChild(div);

  var availProg = document.getElementById(availProgId);
  var reviewProg = document.getElementById(reviewProgId);
  var doneProg = document.getElementById(doneProgId);
  reviewProg.style.color = "black";
  var audioDiv = document.getElementById(audioId)

  updateProgress();
  
  
  function updateProgress() {
    projectRef.listAll().then(res => {

      var bSelect = document.getElementById(baseSelectId);
      if (bSelect != null) {
        res.prefixes.forEach(entryRef => {
          var index = parseInt(entryRef.name, 10)
          bSelect.innerHTML += `<option value="${index}">${index}</option>`
        });
      }

      fileCountLookup[projectName] = res.prefixes.length;
      firebase.database().ref("votes").child(projectName).once('value').then(snapshotVote => {
        firebase.database().ref("users/3fG1zIUGn1hAf8JkDGd500uNuIi1/done/projects").child(projectName).once('value').then(snapshotDone => {
          var voteRatio = 0
          var doneRatio = 0
          var doneEntries = [];
          var votedEntries = [];

          if (snapshotDone.val()) {
            doneEntries = Object.keys(snapshotDone.val());
            doneRatio = 100 * doneEntries.length / totalEntries
          }
          if (snapshotVote.val()) {
            votedEntries = Object.keys(snapshotVote.val());
            voteRatio = 100 * votedEntries.length / totalEntries
          }
          availRatio = (100 * fileCountLookup[projectName] / totalEntries)

          doneProg.style.width = doneRatio.toString() + "%";
          reviewProg.style.width = (voteRatio - doneRatio).toString() + "%";
          availProg.style.width = (availRatio - voteRatio).toString() + "%";

          if (doneRatio > 5) {
            doneProg.innerText = doneEntries.length;
          }
          if ((voteRatio - doneRatio) > 5) {
            reviewProg.innerText = votedEntries.length - doneEntries.length;
          }
          if ((availRatio - voteRatio) > 5) {
            availProg.innerText = fileCountLookup[projectName] - votedEntries.length;
          }

          doneLookup[projectName] = doneEntries;
          votedLookup[projectName] = votedEntries;

          /* Look for any elements with the class "custom-select" */
          var cSelect = document.getElementById(customSelectId);
          var bSelect = document.getElementById(baseSelectId);

          // After voting bSelect becomes null
          // and accessing properties raises exeptions.
          // This is a very stupid way to stop these errors.
          // FIXME: Should be a better way!!
          if (bSelect == null) {
            return
          }
          /* For each element, create a new DIV that will act
           as the selected item */
          var selectedItem = document.createElement("div");
          selectedItem.id = selectedId
          selectedItem.setAttribute("class", "select-selected");
          // Cannot set this style using CSS
          selectedItem.style = "padding: 0px 10px;"

          // Remove all previous items for selection
          while (cSelect.firstChild) {
            cSelect.removeChild(cSelect.firstChild);
          }
          cSelect.appendChild(selectedItem);
          /*for each element, create a new DIV that will contain the option list:*/
          var selectables = document.createElement("div");
          selectables.id = selectableId;
          selectables.setAttribute("class", "select-items select-hide");

          for (var j = 0; j < bSelect.length; j+= 3) {
            const idxId = "".concat(j.toString(), '_', projectName);
            const multiIndices = document.createElement("div");
            multiIndices.setAttribute("class", "multi-index")
            multiIndices.style = "display: inline-block;";
            multiIndices.id = idxId;
            /*for each option in the original select element,
            create a new DIV that will act as an option item:*/
            for (var k = 0; k < 3; k++) {
              if (j + k >= bSelect.length) {
                break;
              }
              var opt = document.createElement("span");
              opt.setAttribute("class", "opt-idx");
              opt.innerHTML = bSelect.options[j + k].innerHTML;

              var stringNum = ("0000" + parseInt(opt.innerText)).slice(-5);

              // Update background color for status indication
              if (doneEntries.indexOf(stringNum) != -1) {
                // Dark Green for done entries
                opt.style.background = "#08A93D"
              } 
              else if (votedEntries.indexOf(stringNum) != -1) {
                // Yellow for reviewed entries
                opt.style.background = "#F3B301"
              }
              multiIndices.appendChild(opt)
            }
            selectables.appendChild(multiIndices);

            multiIndices.addEventListener("click", function(e) {
              var indices = multiIndices.getElementsByClassName("opt-idx")
              for (var i = 0; i < indices.length; i++) {
                createPlayers(parseInt(indices[i].innerText))
              }
              selectedItem.innerHTML = multiIndices.innerHTML
            });
          }
          cSelect.appendChild(selectables);
          
          selectedItem.innerHTML = selectables.firstChild.innerHTML

          selectedItem.addEventListener("click", function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
          });
        })
      })
    })
  }

  function createPlayers(index) {
    if (openIndexLookup[projectName].includes(index)) {
      // If the new index is already opened, ignore it
      // otherwise the id duplication error occurs.
      return
    } else {
      openIndexLookup[projectName].push(index)
    }

    // Maybe this is not an optimal way to pass parameters
    // but this is very convinient for this specific part
    entryRef = projectRef.child(("0000" + index).slice(-5));
    entries = item["entries"];
    currentWanted = item["wanted"];
    upperNote = item["upn"];
    lowerNote = item["lon"];
    appendAudio(audioId, item["dirname"]);
    /////////  //////////  ///////////  ////

    // Show spinner and this will be removed in addPlayer.js
    $("#" + spinId).removeClass("hide-loader");
    // Remove the spin class in case of faild loading.
    setTimeout(() => {
      $("#" + spinId).addClass("hide-loader");
      document.getElementById(controlId).style.display = "block";
      document.getElementById(voteBtnId).style.display = "inline-block";
    }, 5000);
    document.getElementById(controlId).style.display = "none"
    document.getElementById(voteBtnId).style.display = "none"
  }

  document.getElementById(titleId).addEventListener("click", e => {
    if (document.getElementById(selectedId) == null) {
      // Stop when base selector is NOT ready!
      // TODO: Probably there is a better way to do this.
      e.stopPropagation();
    } else if (audioDiv.innerHTML.trim() == "" && document.getElementById(projectName).className == "collapse") {
      // MAYBE: To prevent double loading which induce the unplayable player error
      removeAllPlayers(audioId)
      var selected = document.getElementById(selectedId);

      if (openIndexLookup[projectName].length >= 50) {
        alert(moreThanWarning)
        return
      }
      var spans = selected.getElementsByClassName('opt-idx');
      for (var j = 0; j < spans.length; j++) {
        createPlayers(parseInt(spans[j].innerText))
      }
    }
  })
  document.getElementById(loadBtnId).addEventListener("click", () => {
    // If more than 50 entries are open, let users do the vote first.
    var multiIndices = document.getElementById(selectableId).getElementsByClassName("multi-index");
    var selected = document.getElementById(selectedId);
    var nextIndices = null;

    for (var i = 0; i < multiIndices.length; i++) {
      if (selected.innerHTML == multiIndices[i].innerHTML) {
        if (openIndexLookup[projectName].length >= 50) {
          alert(moreThanWarning)
          return
        }
        if (i >= multiIndices.length - 1) {
          nextIndices = multiIndices[0];
        } else {
          nextIndices = multiIndices[i + 1];
        }

        var spans = nextIndices.getElementsByClassName('opt-idx');
        for (var j = 0; j < spans.length; j++) {
          createPlayers(parseInt(spans[j].innerText))
        }
        selected.innerHTML = nextIndices.innerHTML;
        break;
      }
    }
  })
  document.getElementById(voteBtnId).addEventListener("click", () => {
    getVotes(voteClass);
    removeAllPlayers(audioId);
    openIndexLookup[projectName] = [];

    var multiIndices = document.getElementById(selectableId).getElementsByClassName("multi-index");
    var selected = document.getElementById(selectedId);
    var nextIndices = null;

    for (var i = 0; i < multiIndices.length; i++) {
      if (selected.innerHTML == multiIndices[i].innerHTML) {
        if (i >= multiIndices.length - 1) {
          nextIndices = multiIndices[0];
        } else {
          nextIndices = multiIndices[i + 1];
        }
        var spans = nextIndices.getElementsByClassName('opt-idx');
        for (var j = 0; j < spans.length; j++) {
          createPlayers(parseInt(spans[j].innerText))
        }
        selected.innerHTML = nextIndices.innerHTML;
        updateProgress();
        break;
      }
    }
  })
  document.getElementById(autoBtnId).addEventListener('click', () => {
    var autoBtn = document.getElementById(autoBtnId)
    var playBtns = audioDiv.getElementsByClassName("fa fa-play ml-2");
    if (autoBtn.value == "off" && playBtns.length > 0) {
      autoBtn.value = "on"
      autoBtn.innerHTML = `Auto <a class="fa fa-pause">`

      // FIXME: Considerably messy...
      var players = document.getElementsByClassName("card-player")
      var pauseBtns = audioDiv.getElementsByClassName("fa fa-pause ml-2");
      while(pauseBtns.length > 0) {
        pauseBtns[0].classList.replace('fa-pause', 'fa-play');
      }
      // Stop currently playing audio because it activates multiple auto threads
      for (var i = 0; i < players.length; i++) {
        if (!players[i].paused) {
          players[i].load()
        }
      }
      playBtns[0].click();
    } else if (autoBtn.value == "on") {
      autoBtn.value = "off"
      autoBtn.innerHTML = `Auto <a class="fa fa-volume-up">`
    }
  })
  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  /*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
  document.addEventListener("click", closeAllSelect);
}

function appendAudio(idToAppend, projectName) {
  entryRef.listAll().then(res => {
    res.prefixes.forEach(userRef => {
      userRef.listAll().then(res => {
        for (var wavRef of res.items) {
          if (wavRef.name.startsWith('n_d_')) {
            addPlayer(wavRef, idToAppend, projectName);
          }
        }
      })
    })
  })
}
function playNext(audioDiv, justEnded, autoBtnId) {
  var players = audioDiv.getElementsByClassName("fa fa-play ml-2");
  var arrayOfId = [];
  for (var i = 0; i < players.length; i++) {
    arrayOfId.push(players[i].id)
  }
  var indexJustEnded = arrayOfId.indexOf(justEnded)
  if (indexJustEnded < arrayOfId.length - 1) {
    document.getElementById(arrayOfId[indexJustEnded + 1]).click()
  } else {
    // Turn off the auto playing if there is nothing to play anymore
    var autoBtn = document.getElementById(autoBtnId)
    autoBtn.value = "off"
    autoBtn.innerHTML = `Auto <a class="fa fa-volume-up">`
  }
}

