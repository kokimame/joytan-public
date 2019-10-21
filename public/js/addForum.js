function addForum(entryData, index) {
    const div = document.createElement('div');
    const toggleId = "toggle_" + index;
    const collapseId = "collapse_" + index;
    const boardId = "board_" + index;
    const formId = "form_" + index;
    const submitId = "submit_" + index;
    const textId = "text_" + index;
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
      <div class="card card-body" id="${boardId}">
        <div class="comment">
            <div class="commentor-name">
            #1 Kohki Mametani
            </div>
            <div class="comment-text">
            This is some comment written by an admin!
            </div>
        </div>
        <hr />
        <div class="form-div">
            <span>Comment</span>
            <textarea id="${textId}" name="subject" 
            placeholder="Edit/Delete feature is yet to be introduced...
Only off-topic comments/spams will be removed." style="height:150px"></textarea>
            <button class="btn btn-success" id="${submitId}">Submit</button>
        </div>
    </div>
    `;
    // TODO: Audio auto-play
    document.getElementById('forum-accordion').appendChild(div);

    document.getElementById(submitId).addEventListener("click", () => {
        console.log($("#" + textId).val())
    })

}