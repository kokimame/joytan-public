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
    const commentCntId = "comment_cnt_" + index;
    const commentAllId = "comment_all_" + index;
    const targetForum = `forum/${dirname}/${index}`
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
            ${numbering} <span id="${commentCntId}"></span>
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
        <div class="comment-form">
            <div>
                <div>Name</div>
                <input id="${nameId}" class="comment-name-input" 
                    type="text" maxlength="32" name="username" placeholder="Name"></input>
            </div>
            <div>Comment <span id="${charCntId}">0/500</span>
            </div>
            <textarea id="${textId}" class="comment-textarea" name="subject" maxlength='500'
            placeholder="Edit feature is currently under development." style="height:150px"></textarea>
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
        loadComments(targetForum, boardId, spinId, commentCntId, commentAllId)
    })

    document.getElementById(submitId).addEventListener("click", () => {
        var commentName = $("#" + nameId).val()
        var commentText = $("#" + textId).val()
        var isValidatedOrMsg = validateComment(commentText);
        if (isValidatedOrMsg !== true) {
            alert(isValidatedOrMsg);
        } else {
            $("#" + spinId).removeClass("hide-loader");
            const user = firebase.auth().currentUser;
            if (user) {
                var commentKey = writeCommentData(
                    index, dirname, user.uid, commentName, commentText, 0
                )
            } else {
                writeCommentData(
                    index, dirname, "", commentName, commentText, 0
                )
            }
            $("#" + textId).val("")
            loadComments(targetForum, boardId, spinId, commentCntId, commentAllId)
        }
    })
}

function rewriteCommentId(cRef, state) {
    $(`#${cRef} .space-between .comment-name`).html(`Deleted by User`)
    $(`#${cRef} .space-between .comment-date`).html(timeSince(Date.now()))
    $(`#${cRef} .comment-text`).html(``)
    $(`#${cRef} .comment-control`).html(``)
}

function loadComments(reference, boardId, spinId, commentCntId, commentAllId) {
    firebase.database().ref(reference).once('value').then(comments => {
        var commentDatas = comments.val();
        var commentCntExc = 0;  // Comment counter excluding deleted comments
        var commentCntInc = 0; // Comment counter including deleted comments
        for (var cRef in commentDatas){
            if ($("#" + cRef).length !== 0) {
                continue;
            }
            commentData = commentDatas[cRef];
            if (commentData["s"] == 0) {
                commentCntExc += 1;
                commentCntInc += 1;
            } else {
                commentCntInc += 1;
            }
            var [cName, cText] = clientTextProc(
                commentData["n"], commentData["t"], commentData["s"]
            );
            var dateSince = timeSince(commentData["d"])
            var commentHtml = `
            <div id="${cRef}" class="comment-main">
                <div class="space-between">
                    <div class="commentor-info">
                    <span style="font-size: 14px;">#${commentCntInc}</span>
                    <span class="comment-name">${cName}</span>
                    </div>
                    <span class="comment-date">${dateSince}</span>
                </div>
                <div class="comment-text">${cText}</div>
                <span class="comment-control"></span>
            </div>
            <hr class="comment-separator" />
            `
            document.getElementById(boardId).innerHTML += commentHtml

            const user = firebase.auth().currentUser;
            if (user && user.uid == commentData["u"]) {
                const databaseKey = commentData["k"]
                const savedUserKey = commentData["sk"]
                const editBtnId = `${cRef}_${commentCntExc}_edit`
                const trashBtnId = `${cRef}_${commentCntExc}_trash`
                $(`#${cRef} .comment-control`).html(`
                <!--- <i id="${editBtnId}"
                      class="fas fa-edit clickable-font" 
                      style="padding-right: 3px"></i> --->
                <i id="${trashBtnId}" class="far fa-trash-alt clickable-font"></i>
                `)
                $(`#${editBtnId}`).click(ev => {
                    console.log(`${editBtnId} clicked`)
                })
                $(`#${trashBtnId}`).click(ev => {
                    rewriteCommentId(cRef, 1)
                    deleteCommentData(reference, databaseKey)
                    deleteUserComment(user.uid, dirname, savedUserKey)
                })
            }

            // Counter span was not added in the index.html and need to initialize
            if (commentCntInc <= 1) {
                document.getElementById(commentCntId).innerHTML = 
                `<span style="font-size: 16px"><i class="fa fa-comment"></i></span>
                    <span style="font-size: 12px; margin: 0px 2px;">&#10005;</span>
                    <span id="${commentAllId}">${commentCntInc}</span>`
            } else {
                document.getElementById(commentAllId).innerText = commentCntInc;
            }
        }
        $("#" + spinId).addClass("hide-loader")
    })
}

function clientTextProc(name, text, state) {
    if (state == 1) {
        name = "Deleted by User"
    }
    else if (state == 0 && name == "") {
        name = "<b>Anonymous writer</b>"
    }
    else {
        name = `<b>${name}</b>`
    }
    return [name, text]
}

function writeCommentData(index, dirname, uid, name, text, state) {
    var updates = {}
    const target = `forum/${dirname}/${index}`
    const databaseKey = firebase.database().ref(target).push().key;
    const savedUserKey = saveUserComment(uid, dirname, databaseKey)
    const commentData = {
        t: text,
        n: name,
        u: uid,
        d: Date.now(),
        s: state,
        k: databaseKey,
        sk: savedUserKey
      }
    updates[databaseKey] = commentData
    firebase.database().ref(target).update(updates)
    return databaseKey
}

function deleteCommentData(target, key) {
    var updates = {}
    const deletedData = {
        t: "",
        n: "",
        u: "",
        d: Date.now(),
        s: 1,
        k: ""
    }
    updates[key] = deletedData
    firebase.database().ref(target).update(updates)
}

function saveUserComment(uid, dirname, databaseKey) {
    var data = {
        k: databaseKey
    }
    var target = `users/${uid}/comment/${dirname}`
    var updates = {}
    var savedUserKey = firebase.database().ref(target).push().key
    updates[savedUserKey] = data
    firebase.database().ref(target).update(updates)
    return savedUserKey
}

function deleteUserComment(uid, dirname, savedUserKey) {
    var target = `users/${uid}/comment/${dirname}/${savedUserKey}`
    console.log("Delete user data at ", target)
    firebase.database().ref(target).remove()
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
