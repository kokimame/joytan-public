var pageLookup = {}

function addProject(pData) {
  const div = document.createElement('div');
  const projectName = pData["dirname"]
  const pagingId = "paging_" + projectName
  const lastUpdatedId = "last_" + projectName
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
  const playerPerPage = 20;

  pageLookup[projectName] = [];

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
    <span class="last-updated">
      Last updated: <span id="${lastUpdatedId}"></span>
    </span>
    <span class="forum-link" id="${forumId}">
      Go to Forum <a class="far fa-comments" style="text-decoration: underline"></a>
    </span>
  </button>
  <div class="collapse" id="${projectName}" data-parent="#projectsTop">
    <div class="card card-body" id="${cardId}">
      <span class="pagination" id="${controlId}">
        <ul id="${pagingId}"></ul>
        <span class="total-count"><span id="${contribId}"></span> contributions</span>
        <button type="button" class="btn btn-slim btn-warning auto-play" id="${autoBtnId}" value="off">
        Auto <a class="fa fa-volume-up"></a></button>
      </span>
      <div id="${spinId}" class="spinner-wrapper">
      <i class="fa fa-spinner fa-spin fa-2x fa-fw"></i>
      </div>
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
  setLastUpdated();

  function setLastUpdated() {
    var db = firebase.firestore()
    db.collection(`projects/${projectName}/voice`).
            orderBy("created_at", "desc").limit(1).get().then(result => {
      if (result.docs.length == 1) {
        var data = result.docs[0].data()
        var creationTime = data['created_at'].toDate()
        $(`#${lastUpdatedId}`).html(timeSince(creationTime))
      }
    })
  }
  
  function setupPagination() {
    var db = firebase.firestore()
    db.collection(`projects/${projectName}/voice`).orderBy("created_at", "desc").get().then(result => {
      $(`#${contribId}`).html(result.size)
      $(`#${pagingId}`).pagination({
        items: result.size,
        itemsOnPage: playerPerPage,
        edges: 1,
        prevText: "Back",
        displayedPages: 3,
        onPageClick: function(pageNumber, event) {
          event.preventDefault() 
          nextPage(pageNumber)
        },
        cssStyle: 'light-theme'
      });
      pageLookup[projectName] = result
      nextPage(1)
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

  function nextPage(index) {
    // Show spinner and the spinner will be removed in addPlayer.js
    $("#" + spinId).removeClass("hide-loader");
    // Remove the spin class in case of faild loading.
    setTimeout(() => {
      $("#" + spinId).addClass("hide-loader");
      $("#" + controlId).show();
    }, 5000);
    $("#" + controlId).hide();

    removeAllPlayers(audioId)
    index = index - 1
    for (var i = index * playerPerPage; i < (index + 1) * playerPerPage; i += 1) {
      if (i >= pageLookup[projectName].docs.length) {
        break
      }
      doc = pageLookup[projectName].docs[i]
      addPlayer(doc.id, doc.data(), audioId)
    }
  }
  
  function setupProgressBar() {
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
      availProg.innerText = availEntries.length - votedEntries.length;
    }
  }

  document.getElementById(titleId).addEventListener("click", e => {
    // No HTML in audio field and card is collapsed
    if (audioDiv.innerHTML.trim() == "" && 
        document.getElementById(projectName).className == "collapse") {
      setupPagination();
    }
  })

  $(`#${forumId}`).bind('click auxclick', () => {
    window.open("forum/?p=" + projectName, '_blank')
  })

  document.getElementById(autoBtnId).addEventListener('click', () => {
    var autoBtn = document.getElementById(autoBtnId)
    console.log("Auto Clicked")

    var playBtns = audioDiv.getElementsByClassName("fa fa-play");
    if (autoBtn.value == "off" && playBtns.length > 0) {
      autoBtn.value = "on"
      autoBtn.innerHTML = `Auto <a class="fa fa-pause">`

      // FIXME: Considerably messy...
      var players = document.getElementsByClassName("card-player")
      var pauseBtns = audioDiv.getElementsByClassName("fa fa-pause");
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
  var players = audioDiv.getElementsByClassName("fa fa-play");
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

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
      return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}