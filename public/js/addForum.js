function addForum(entryData, index) {
    const div = document.createElement('div');
    const toggleId = "toggle_" + index;
    const collapseId = "collapse_" + index;
    const boardId = "board_" + index;
    const formId = "form_" + index;
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
            <form action="/action_page.php">
            <span>Comment</span>
            <textarea id="subject" name="subject" 
            placeholder="Write something.." style="height:150px"></textarea>
            <input type="submit" value="Submit">
        </div>
    </div>
    `;
    // TODO: Audio auto-play
    document.getElementById('forum-accordion').appendChild(div);

}