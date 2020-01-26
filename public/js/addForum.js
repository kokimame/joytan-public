function addForum(index) {
  const entryData = entries[index]
  const entryId = entryData["id"]
  const div = document.createElement('div');
  const boardId = "board_" + index;
  const nameId = "name_" + index;
  const ytId = "yt_" + index;
  const commentCntId = "comment_cnt_" + entryId;
  const commentAllId = "comment_all_" + entryId;
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
  
  // This workaround (using jq for jQuery defined outside) is simple but a little bit ugly.
  jq(`#${boardId}`).comments({
    enableUpvoting: false,
    noCommentsText: 'Be the first to start discussion',
    // profilePictureURL: 'https://viima-app.s3.amazonaws.com/media/public/defaults/user-icon.png',
    getComments: (success, error) => {
      db.collection(`forum/${entryId}/comment`).get().then(commentDatas => {
        var commentArray = []
        commentDatas.forEach(doc => {
          var commentJSON = doc.data();
          console.log(commentJSON.created_by_current_user)
          if (user && user.uid == commentJSON.client_id) {
            commentJSON.created_by_current_user = true
          } else {
            commentJSON.created_by_current_user = false
          }

          commentArray.push(commentJSON)
          console.log("getComment ", doc.data())
        })
        success(commentArray);
      });
    },
    postComment: function(commentJSON, success, error) {
      const commentRef = db.collection(`forum/${entryId}/comment`).doc();
      var batch = db.batch()
      commentJSON.uid = commentRef.id

      if (user) {
        commentJSON.fullname = user.displayName;
        commentJSON.client_id = user.uid;
      } else {
        commentJSON.fullname = 'Anonymous helper';
      }
      
      batch.set(commentRef, commentJSON)
      batch.commit().then(() => {
        success(commentJSON)
        var count = $(`#${commentAllId}`).attr('data-count')
        if (typeof count == 'undefined') {
          document.getElementById(commentCntId).innerHTML = 
            `<span class="comment-counter">
              <i id="${commentAllId}" class="font-layer fa fa-comment"
              data-count="1"></i>
            </span>`
        } else {
          $(`#${commentAllId}`).attr('data-count', parseInt(count) + 1)
        }
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
    },
    deleteComment: function(commentJSON, success, error) {
      db.collection(`forum/${entryId}/comment`).doc(commentJSON.uid).delete().then(() => {
        var count = parseInt($(`#${commentAllId}`).attr('data-count'))
        if (count == 1) {
          document.getElementById(commentCntId).innerHTML = ``
        } else {
          $(`#${commentAllId}`).attr('data-count', count - 1)
        }
        success()
      })
    }
  });
}