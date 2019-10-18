function addForum(entryData, index) {
    const div = document.createElement('div');
    const toggleId = "toggle_" + index;
    const collapseId = "collapse_" + index;
    const boardId = "board_" + index;
    const formId = "form_" + index;
    const numbering = (parseInt(index) + 1).toString();

    div.innerHTML = `
    <button class="btn btn-square btn-outline-dark btn-block text-left collapsed" type="button" 
    data-toggle="collapse" data-target="#${collapseId}" aria-expanded="false" id="${toggleId}">

        <div class="small-index">
            ${numbering}
        </div>
        <table class="btn-title" >
            <td>
                ${entryData[wantedKey]}
            </td>
        </table>
    </button>
    <div class="collapse" id="${collapseId}" data-parent="#forum-accordion">
      <div class="card card-body" id="${boardId}">
        <div class="form-div">
            <form class="form" id="${formId}">
            <p class="name">
                <input name="name" type="text" class="validate[required,custom[onlyLetter],length[0,100]] feedback-input" placeholder="Name" id="name" />
            </p>
            <p class="text">
                <textarea name="text" class="validate[required,length[6,300]] feedback-input" id="comment" placeholder="Comment"></textarea>
            </p>
            <div class="submit">
                <input type="submit" value="SEND" class="button-blue"/>
                <div class="ease"></div>
            </div>
            </form>
        </div>
    </div>
    `;
    // TODO: Audio auto-play
    document.getElementById('forum-accordion').appendChild(div);

}