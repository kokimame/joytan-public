function addForum(entryData, index) {
    const div = document.createElement('div');
    const toggleId = "toggle_" + index;
    const collapseId = "collapse_" + index;
    const boardId = "board_" + index;
    const numbering = (parseInt(index) + 1).toString();

    div.innerHTML = `
    <br />
      <button class="btn btn-outline-dark btn-block text-left collapsed" type="button" 
        data-toggle="collapse" data-target="#${collapseId}" aria-expanded="false" id="${toggleId}">
        <i class="fa fa-chevron-down pull-right"></i>
        <div class"btn-title" >
            #${numbering} ${entryData[wantedKey]}
        </div>
      </button>
    <div class="collapse" id="${collapseId}" data-parent="#forum-accordion">
      <div class="card card-body" id="${boardId}">
    </div>
    `;
    // TODO: Audio auto-play
    document.getElementById('forum-accordion').appendChild(div);

}