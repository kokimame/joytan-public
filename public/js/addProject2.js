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
  const pagingId = "paging_" + projectName
  const controlId = "control_" + projectName
  const autoBtnId = "auto_" + projectName
  const forumId = "forum_" + projectName
  const cardId = "card_" + projectName
  const audioId = "audio_" + projectName
  const spinId = "spin_" + projectName
  const titleId = "title_" + projectName
  const contribId = "contrib_" + projectName
  const doneProgId = "done_" + titleId
  const reviewProgId = "review_" + titleId
  const availProgId = "avail_" + titleId
  const totalEntries = pData["size"];
  var titleFixed = pData["flags"] + pData["title"]

  fileCountLookup[projectName] = 0;
  openIndexLookup[projectName] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <button class="btn btn-block text-left collapsed btn-title" type="button" 
    data-toggle="collapse" data-target="#${projectName}" aria-expanded="false" id="${titleId}">
    <i class="fa fa-chevron-down pull-right"></i>
    <div class="title-in-btn" >
      ${titleFixed}
    </div>
    
    <div class="progress" style="border-radius: 10px">
      <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
        role="progressbar" style="width: 0%; height: 100%;" aria-valuenow="10" 
        aria-valuemin="0" aria-valuemax="100" id="${doneProgId}"></div>
      <div class="progress-bar bg-warning" 
        role="progressbar" 
        style="width: 0%; height: 90%; color: black;" aria-valuenow="10" 
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
      <div id="${spinId}" class="spinner-wrapper">
        <i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
      </div>
      <span class="pagination"  id="${controlId}">
        <span id="${pagingId}">		
          <span class="page-back page-numbers">« Back</span>
          <span class="page-next page-numbers">Next »</span>
          <span class="page-numbers current">1</span>
          <span class="page-numbers">2</span>
          <span class="page-numbers">3</span>
          <span class="dots">...</span>
          <span class="page-numbers">17</span>
          <span class="total-count"><span id="${contribId}"></span> contributions</span>
        </span>
        <button type="button" class="btn btn-slim btn-warning auto-play" id="${autoBtnId}" value="off">
        Auto <a class="fa fa-volume-up"></a></button>
      </span>
      <div id="${audioId}" class="player-field">
      </div>
    </div>
  </div>
  <br />
  `;
  // TODO: Audio auto-play
  document.getElementById('projectsTop').appendChild(div);

  var availProg = document.getElementById(availProgId);
  var reviewProg = document.getElementById(reviewProgId);
  var doneProg = document.getElementById(doneProgId);
  var audioDiv = document.getElementById(audioId)

  setupProgressBar();

  function openNewPage() {

  }

  function setupPagination() {
    var db = firebase.firestore()
    db.collection(`projects/${projectName}/voice`).get().then(result => {
      $(`#${contribId}`).html(result.size)
      createPlayersWithResult(result)
    })
    // Show spinner and the spinner will be removed in addPlayer.js
    $("#" + spinId).removeClass("hide-loader");
    // Remove the spin class in case of faild loading.
    setTimeout(() => {
      $("#" + spinId).addClass("hide-loader");
      $("#" + controlId).show();
    }, 5000);
    $("#" + controlId).hide();
  }
  
  function setupProgressBar() {
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
  }

  function createPlayersWithResult(result) {
    result.forEach(doc => {
      console.log(doc.id, ' and ', doc.data())
      addPlayer2(doc.id, doc.data(), audioId)
    })
  }

  function createPlayers(index) {
    var db = firebase.firestore()
    db.collection(`projects/${projectName}/voice`).get().then(result => {
      createPlayersWithResult(result)
    })

    // Show spinner and the spinner will be removed in addPlayer.js
    $("#" + spinId).removeClass("hide-loader");
    // Remove the spin class in case of faild loading.
    setTimeout(() => {
      $("#" + spinId).addClass("hide-loader");
      document.getElementById(controlId).style.display = "block";
    }, 5000);
    document.getElementById(controlId).style.display = "none"
  }

  document.getElementById(titleId).addEventListener("click", e => {
    // No HTML in audio field and card is collapsed
    if (audioDiv.innerHTML.trim() == "" && 
        document.getElementById(projectName).className == "collapse") {
      setupPagination();
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