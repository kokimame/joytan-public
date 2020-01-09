var fileCountLookup = {};
var votedLookup = {};
var doneLookup = {};
var openIndexLookup = {};
var cardPallete = ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94",
                   "#ebf4f6", "#bdeaee", "#90cdd6", "#fff6e9", "#ffefd7", 
                   "#fffef9", "#e3f0ff", "#d2e7ff"];


function addProject2(pData) {
  const div = document.createElement('div');
  const projectName = pData["dirname"]
  const loadBtnId = "loadBtn_" + projectName
  const voteBtnId = "voteBtn_" + projectName
  const controlId = "control_" + projectName
  const autoBtnId = "auto_" + projectName
  const forumId = "forum_" + projectName
  const voteClass = "vote_" + projectName
  const customSelectId = "cSelect_" + projectName
  const baseSelectId = "bSelect_" + projectName
  const selectableId = "selectable_" + projectName
  const selectedId = "selected_" + projectName
  const cardId = "card_" + projectName
  const audioId = "audio_" + projectName
  const spinId = "spin_" + projectName
  const titleId = "title_" + projectName
  const doneProgId = "done_" + titleId
  const reviewProgId = "review_" + titleId
  const availProgId = "avail_" + titleId
  const totalEntries = pData["size"];
  var titleFixed = pData["flags"] + pData["title"]

  fileCountLookup[projectName] = 0;
  openIndexLookup[projectName] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <button class="btn btn-outline-dark btn-block text-left collapsed" type="button" 
    data-toggle="collapse" data-target="#${projectName}" aria-expanded="false" id="${titleId}">
    <i class="fa fa-chevron-down pull-right"></i>
    <div class="btn-title" >
      ${titleFixed}
    </div>
    
    <div class="progress" style="border-radius: 10px">
      <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
        role="progressbar" style="width: 0%; height: 100%;" aria-valuenow="10" 
        aria-valuemin="0" aria-valuemax="100" id="${doneProgId}"></div>
      <div class="progress-bar bg-warning" 
        role="progressbar" 
        style="width: 0%; height: 90%;" aria-valuenow="10" 
        aria-valuemin="0" aria-valuemax="100" id="${reviewProgId}"></div>
      <div class="progress-bar bg-info" role="progressbar" 
        style="width: 0%; height: 80%; border-radius: 0px 10px 10px 0px;" aria-valuenow="30"
        aria-valuemin="0" aria-valuemax="100" id="${availProgId}"></div>
    </div>
    <span class="forum-link" id="${forumId}">
      Go to Forum <a class="far fa-comments" style="text-decoration: underline"></a>
    </span>
  </button>
  <div class="collapse" id="${projectName}" data-parent="#projectsTop">
    <div class="card card-body" id="${cardId}">
      <div class="load-control" style="height: 40px;">
        <div id="${spinId}">
          <i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
        </div>
        <div id="${controlId}">
          <button type="button" class="btn btn-slim btn-success" id="${loadBtnId}">Load</button>
          <div class="custom-select" id="${customSelectId}">
            <select class="form-control" id="${baseSelectId}">
            </select>
          </div>
          <button type="button" class="btn btn-slim btn-success auto-play" id="${autoBtnId}" value="off">
            Auto <a class="fa fa-volume-up"></a></button>
        </div>
      </div>
      <hr style="margin-bottom: 12px;" />
      <div id="${audioId}" style="display: inline-block;">
      </div>
      <button type="button" id="${voteBtnId}" class="btn btn-slim btn-success btn-vote"
        style="display: inline-block;">Vote & Next</button>
    </div>
  </div>
  <br />
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
    var bSelect = document.getElementById(baseSelectId);
    if (bSelect != null) {
      pData["available"].forEach(index => {
        bSelect.innerHTML += `<option value="${index}">${index}</option>`
      });
    }

    fileCountLookup[projectName] = pData["available"].length;
    var availEntries = pData["available"];
    var votedEntries = pData["voted"];
    var doneEntries = pData["done"];

    const availRatio = 100 * availEntries.length / totalEntries;
    const votedRatio = 100 * votedEntries.length / totalEntries;
    const doneRatio = 100 * doneEntries.length / totalEntries;

    doneProg.style.width = doneRatio.toString() + "%";
    reviewProg.style.width = (votedRatio - doneRatio).toString() + "%";
    availProg.style.width = (availRatio - votedRatio).toString() + "%";

    if (doneRatio > 5) {
      doneProg.innerText = doneEntries.length;
    }
    if ((votedRatio - doneRatio) > 5) {
      reviewProg.innerText = votedEntries.length - doneEntries.length;
    }
    if ((availRatio - votedRatio) > 5) {
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
      multiIndices.id = idxId;
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      for (var k = 0; k < 3; k++) {
        if (j + k >= bSelect.length) {
          break;
        }
        var opt = document.createElement("div");
        opt.setAttribute("class", "opt-idx");
        opt.innerHTML = bSelect.options[j + k].innerHTML;

        var numIndex = parseInt(opt.innerText);

          // Update background color for status indication
        if (doneEntries.indexOf(numIndex) != -1) {
          // Dark Green for done entries
          opt.style.background = "#08A93D"
        } 
        else if (votedEntries.indexOf(numIndex) != -1) {
          // Yellow for reviewed entries
          opt.style.background = "#F3B301"
        }
        multiIndices.appendChild(opt)
      }
      selectables.appendChild(multiIndices);

      multiIndices.addEventListener("click", function(e) {
        var indices = multiIndices.getElementsByClassName("opt-idx")
        createPlayers(parseInt(indices[0].innerText))
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
  }

  function createPlayers(index) {
    // if (openIndexLookup[projectName].includes(index)) {
    //   // If the new index is already opened, ignore it
    //   // otherwise the id duplication error occurs.
    //   return
    // } else {
    //   openIndexLookup[projectName].push(index)
    // }
    var db = firebase.firestore()
    db.collection(`projects/${projectName}/voice`).get().then(result => {
      result.forEach(doc => {
        console.log(doc.id, ' and ', doc.data())
        addPlayer2(doc.id, doc.data(), audioId)
      })
    })

    // Show spinner and the spinner will be removed in addPlayer.js
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
      var divs = selected.getElementsByClassName('opt-idx');
      createPlayers(parseInt(divs[0].innerText))
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
        createPlayers(parseInt(spans[0].innerText))
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
        createPlayers(parseInt(spans[0].innerText))
        selected.innerHTML = nextIndices.innerHTML;
        updateProgress();
        break;
      }
    }
  })

  document.getElementById(forumId).addEventListener('click', () => {
    window.open("forum/?p=" + projectName, '_blank')
  })
  document.getElementById(forumId).addEventListener('auxclick', () => {
    window.open("forum/?p=" + projectName, '_blank')
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