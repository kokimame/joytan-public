function addForum(entryData, index) {
    const div = document.createElement('div');
    const toggleId = "toggle_" + index;
    const collapseId = "collapse_" + index;
    const boardId = "board_" + index;
    const submitId = "submit_" + index;
    const nameId = "name_" + index;
    const textId = "text_" + index;
    const spinId = "spin_" + index;
    const charCntId = "char_" + index;
    const forumTarget = `forum/${dirname}/${index}`
    const numbering = (parseInt(index) + 1).toString();
    var upperNote = "";
    var lowerNote = "";
    if (upnKey !== "") {
        upperNote = entryData[upnKey];
    }
    if (lonKey !== "") {
        lowerNote = entryData[lonKey];
    }

    div.innerHTML = `
    <button class="btn btn-square btn-outline-dark btn-block text-left collapsed" type="button" 
    data-toggle="collapse" data-target="#${collapseId}" aria-expanded="false" id="${toggleId}">
        <div class="small-index">
            ${numbering}
        </div>
        <table class="btn-title" >
        <tr>
            <td class="td-note">
                ${upperNote}
            </td>
        </tr>
        <tr>
            <td>${entryData[wantedKey]}</td>
        </tr>
        <tr>
            <td class="td-note">
                ${lowerNote}
            </td>
        </tr>
        </table>
    </button>
    <div class="collapse" id="${collapseId}" data-parent="#forum-accordion">
      <div class="card card-body">
        <div id="${boardId}" class="comment">
        </div>
        <div id="${spinId}">
            <div class="spinning"></div>
        </div>
        <div class="form-div">
            <div>
                <div>Name</div>
                <input id="${nameId}" type="text" maxlength="32"
                name="username" placeholder="Name">
            </div>
            <div>Comment <span id="${charCntId}">0/500</span>
            </div>
            <textarea id="${textId}" name="subject" maxlength='500'
            placeholder="Edit/Delete feature is yet to be introduced...
Only off-topic comments/spams will be removed." style="height:150px"></textarea>
            <button class="btn btn-success btn-submit" id="${submitId}">
            Submit</button>
        </div>
    </div>
    `;
    // TODO: Audio auto-play
    document.getElementById('forum-accordion').appendChild(div);

    document.getElementById(textId).addEventListener("input", () => {
        textarea = document.getElementById(textId);
        var maxlength = textarea.maxLength;
        var currentLength = textarea.value.length;
        $("#" + charCntId).text(currentLength + "/" + maxlength);
    });

    document.getElementById(toggleId).addEventListener("click", () => {
        const user = firebase.auth().currentUser;
        if (user) {
            $("#" + nameId).val(user.displayName);
        }
        $("#" + spinId).removeClass("hide-loader");
        getComments(forumTarget, boardId, spinId)
    })

    document.getElementById(submitId).addEventListener("click", () => {
        var commentName = $("#" + nameId).val()
        var commentText = $("#" + textId).val()
        var isValidatedOrMsg = validateComment(commentText);
        console.log(isValidatedOrMsg)
        if (isValidatedOrMsg !== true) {
            alert(isValidatedOrMsg);
        } else {
            $("#" + spinId).removeClass("hide-loader");
            writeCommentData(forumTarget, commentName, commentText)
            $("#" + textId).val("")
            getComments(forumTarget, boardId, spinId)
        }
    })
}

function getComments(reference, boardId, spinId) {
    firebase.database().ref(reference).once('value').then(comments => {
        var commentDatas = comments.val();
        var cCounter = 0; 
        for (var cRef in commentDatas){
            cCounter += 1;
            if ($("#" + cRef).length !== 0) {
                continue;
            }
            commentData = commentDatas[cRef];
            var [cName, cText] = clientTextProc(
                commentData["name"], commentData["text"]
            );
            var dateSince = timeSince(commentData["date"])
            var commentHtml = `
            <div id="${cRef}" class="comment-form">
                <div class="space-between">
                    <div class="commentor-name">
                    <span style="font-size: 14px;">#${cCounter}</span>
                    <span style="font-weight: bold;">${cName}</span>
                    </div>
                    <span class="date-since">${dateSince}</span>
                </div>
                <div class="comment-text">${cText}</div>
                <hr class="comment-separator" />
            </div>`
            document.getElementById(boardId).innerHTML += commentHtml
        }
        $("#" + spinId).addClass("hide-loader")
    })
}

function clientTextProc(name, text) {
    if (name == "") {
        name = "Anonymous writer"
    }
    return [name, text]
}

function writeCommentData(target, name, text) {
    var commentData = {
      text: text,
      name: name,
      date: Date.now()
    }
    var newKey = firebase.database().ref(target).push().key;
    var updates = {}
    updates[newKey] = commentData
    firebase.database().ref(target).update(updates)
}

function validateComment(text) {
    if (text.length <= 5) {
        return "Please make a comment longer than 5 characters."
    }
    return true;
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
