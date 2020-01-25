function addForum(index) {
  const entryData = entries[index]
  const entryId = entryData["id"]
  const div = document.createElement('div');
  const boardId = "board_" + index;
  const submitId = "submit_" + index;
  const nameId = "name_" + index;
  const textId = "text_" + index;
  const spinId = "spin_" + index;
  const ytId = "yt_" + index;
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

  var mainScript = entryData[wantedKey];
  // If timeStampData available, add the controller
  if (timestamps != false) {
    var startTime = timestamps[index]
    var endTime = timestamps[index + 1]
    mainScript += ` <a href="javascript:void callPlayer('youtube-player','playDuration',[${startTime}, ${endTime}])">
    <i id="${ytId}" class="fab fa-youtube player-icon"></i></a>`
  }

  div.innerHTML = `
    <div class="board-header">
      <center>
        <table style="position: relative">
          <span class="corner-numbering">${index + 1}</span>
          <tr>
            <td class="td-note">
              ${upperNote}
            </td>
          </tr>
          <tr>
            <td>${mainScript}</td>
          </tr>
          <tr>
            <td class="td-note">
              ${lowerNote}
            </td>
          </tr>
        </table>
      </center>
    </div>
    <div id="${boardId}" class="comment" style="padding: 8px">
    </div>
  </div>
  `;
  // TODO: Audio auto-play
  document.getElementById('comments-container').innerHTML = ``;
  document.getElementById('comments-container').appendChild(div);

  const user = firebase.auth().currentUser;
  const db = firebase.firestore()

  if (user) {
    $(`#${nameId}`).val(user.displayName);
  }
  // $("#" + spinId).removeClass("hide-loader");
  // loadComments(targetForum, boardId, spinId, commentCntId, commentAllId)
  
  // This workaround (using jq for jQuery defined outside) is simple but a little bit ugly.
  jq(`#${boardId}`).comments({
    enableUpvoting: false,
    noCommentsText: 'Be the first to start discussion',
    // profilePictureURL: 'https://viima-app.s3.amazonaws.com/media/public/defaults/user-icon.png',
    getComments: (success, error) => {
      db.collection(`forum/${entryId}/comment`).get().then(commentDatas => {
        var commentArray = []
        commentDatas.forEach(doc => {
          commentArray.push(doc.data())
          console.log("getComment ", doc.data())
        })
        success(commentArray);
      });
    },
    postComment: function(commentJSON, success, error) {
      const commentRef = db.collection(`forum/${entryId}/comment`).doc();
      const counterRef = db.collection(`comment_count`).doc(dirname)
      const increment = firebase.firestore.FieldValue.increment(1);
      var batch = db.batch()

      counterDoc = {}
      counterDoc[entryId] = increment
      commentJSON["uid"] = commentRef.id
      batch.set(commentRef, commentJSON)
      batch.update(counterRef, counterDoc)
      batch.commit().then(() => {
        success(commentJSON)
      })
    },
    putComment: function(commentJSON, success, error) {
      console.log("putComment ", commentJSON)
      const commentRef = db.collection(`forum/${entryId}/comment`).doc(commentJSON.uid);
      var batch = db.batch()
      batch.set(commentRef, commentJSON)
      batch.commit().then(() => {
        success(commentJSON)
      })
    }
  });

  
  // document.getElementById(textId).addEventListener("input", () => {
  //   textarea = document.getElementById(textId);
  //   var maxlength = textarea.maxLength;
  //   var currentLength = textarea.value.length;
  //   $("#" + charCntId).text(currentLength + "/" + maxlength);
  // });

  // document.getElementById(submitId).addEventListener("click", () => {
  //   var commentName = $("#" + nameId).val()
  //   var commentText = $("#" + textId).val()
  //   var isValidatedOrMsg = validateComment(commentText);
  //   if (isValidatedOrMsg !== true) {
  //     alert(isValidatedOrMsg);
  //   } else {
  //     $("#" + spinId).removeClass("hide-loader");
  //     const user = firebase.auth().currentUser;
  //     if (user) {
  //         writeCommentData(
  //             index, dirname, user.uid, commentName, commentText, 0
  //         )
  //     } else {
  //         writeCommentData(
  //             index, dirname, "", commentName, commentText, 0
  //         )
  //     }
  //     $("#" + textId).val("")
  //     loadComments(targetForum, boardId, spinId, commentCntId, commentAllId)
  //   }
  // })
}

function rewriteCommentId(cRef, state) {
    $(`#${cRef} .space-between .comment-name`).html(`Deleted by User`)
    $(`#${cRef} .space-between .comment-date`).html(timeSince(Date.now()))
    $(`#${cRef} .comment-text`).html(``)
    $(`#${cRef} .comment-control`).html(``)
}

// Use global variable to keep a relation 
// between a trash button and [databaseKey, savedUserKey] 
// to be removed.
// This is a (temporary) workaround for event assignment in a loop
// and the care regarding closure.
var trashBtnLookup = {}

function loadComments(reference, boardId, spinId, commentCntId, commentAllId) {

    firebase.database().ref(reference).once('value').then(comments => {
        var commentDatas = comments.val();
        // var commentCntExc = 0;  // Comment counter excluding deleted comments
        var commentCntInc = 0; // Comment counter including deleted comments
        for (var databaseKey in commentDatas){
            commentCntInc += 1;
            if ($("#" + databaseKey).length !== 0) {
                continue;
            }
            commentData = commentDatas[databaseKey];
            var [cName, cText] = clientTextProc(
                commentData["n"], commentData["t"], commentData["s"]
            );
            var dateSince = timeSince(commentData["d"])
            var commentHtml = `
            <div id="${databaseKey}" class="comment-main">
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
                var savedUserKey = commentData["sk"]
                var editBtnId = `${databaseKey}_edit`
                var trashBtnId = `${databaseKey}_trash`

                $(`#${databaseKey} .comment-control`).html(`
                <!--- <i id="${editBtnId}"
                      class="fas fa-edit clickable-font" 
                      style="padding-right: 3px"></i> --->
                <i id="${trashBtnId}" class="far fa-trash-alt clickable-font"></i>
                `)
                
                trashBtnLookup[trashBtnId] = [user.uid, databaseKey, savedUserKey]
            }

            // Counter span was not added in the index.html and need to initialize
            if ($(`#${commentAllId}`).length == 0) {
              document.getElementById(commentCntId).innerHTML = 
              `<span class="comment-counter">
                <i id="${commentAllId}" class="font-layer fa fa-comment"
                 data-count="${commentCntInc}"></i>
              </span>`
            } else {
              $(`#` + commentAllId).attr("data-count", commentCntInc);
            }
        }

        // FIXME: Could be done in a better way
        // This is a (temporary) workaround for 
        // the use of event handler (a closure) in a loop!
        for (let trashBtnId of Object.keys(trashBtnLookup)) {
            $(`#${trashBtnId}`).click(() => {
                [uid, databaseKey, savedUserKey] = trashBtnLookup[trashBtnId]
                rewriteCommentId(databaseKey, 1)
                deleteCommentData(reference, databaseKey)
                deleteUserComment(uid, dirname, savedUserKey)
            })
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
      sk: savedUserKey
    }
    updates[databaseKey] = commentData
    firebase.database().ref(target).update(updates)
    return databaseKey
}

function deleteCommentData(target, key) {
    var updates = {}
    const deletedData = {
      t: "",          // Text
      n: "",          // Commentor's Name
      u: "",          // Commentor's UID
      d: Date.now(),  // Date
      s: 1,           // State
      sk: "",         // savedUserKey
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
