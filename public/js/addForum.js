function addForum(entryData, index) {
    const div = document.createElement('div');
    const toggleId = "toggle_" + index;
    const collapseId = "collapse_" + index;
    const boardId = "board_" + index;
    const submitId = "submit_" + index;
    const nameId = "name_" + index;
    const textId = "text_" + index;
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
        <div class="form-div">
            <div>
                <div>Name</div>
                <input id="${nameId}" type="text" name="usrname" placeholder="Name">
            </div>
            <div>Comment</div>
            <textarea id="${textId}" name="subject" 
            placeholder="Edit/Delete feature is yet to be introduced...
Only off-topic comments/spams will be removed." style="height:150px"></textarea>
            <button class="btn btn-success btn-submit" id="${submitId}">
            Submit</button>
        </div>
    </div>
    `;
    // TODO: Audio auto-play
    document.getElementById('forum-accordion').appendChild(div);

    document.getElementById(toggleId).addEventListener("click", () => {
        document.getElementById(boardId).innerHTML = ""
        getComments(forumTarget, boardId)
    })

    document.getElementById(submitId).addEventListener("click", () => {
        var commentName = $("#" + nameId).val()
        var commentText = $("#" + textId).val()
        writeCommentData(forumTarget, commentName, commentText)
    })
}

function getComments(reference, boardId) {
    firebase.database().ref(reference).once('value').then(comments => {
        var commentDatas = comments.val();
        var cCounter = 0; 
        for (var cRef in commentDatas){
            cCounter += 1;
            commentData = commentDatas[cRef];
            var [cName, cText] = clientTextProc(
                commentData["name"], commentData["text"]
            );
            console.log(commentData)
            var commentHtml = `
            <div class="comment">
                <div class="commentor-name">
                #${cCounter} ${cName}
                </div>
                <div class="comment-text">${cText}</div>
                <hr class="comment-separator" />
            </div>`
            document.getElementById(boardId).innerHTML += commentHtml
        }
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
      name: name
    }
    var newKey = firebase.database().ref(target).push().key;
    var updates = {}
    updates[newKey] = commentData
    firebase.database().ref(target).update(updates)
}