function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function nextQuiz() {
    if($(`#ch-1 .main-script`).css('visibility') == 'hidden') {
        showAnswer()
    } else {
        addQuiz()
    }
}

function showAnswer() {
    for (i = 0; i < 4; i++) {
        $(`#ch-${i+1} .main-script`).css('visibility', 'visible');
        if($(`#ch-${i+1}`).hasClass('answer')) {
            $(`#ch-${i+1}`).css('background-color', 'lightgreen')
        } else {
            $(`#ch-${i+1}`).css('background-color', 'tomato')
        }
    }
}

function addQuiz() 
{
    var enumEntries = []
    // Make a list of [original index, entry data]
    for (const item of entries.entries()) {
        enumEntries.push(item)
    }
    let selected = shuffleArray([...enumEntries]).slice(0, 4);
    let shuffled = shuffleArray([...selected]);
    let answer = selected[0][1][wantedKey];

    var mainScript = selected[0][1][wantedKey];
    // If timeStampData available, add the controller
    if (timestamps != false) {
        const index = selected[0][0];
        const ytId = "yt_" + index;
        var startTime = timestamps[index];
        var endTime = timestamps[index + 1];
        mainScript += ` <a href="javascript:void callPlayer('youtube-player','playDuration',[${startTime}, ${endTime}])">
        <i id="${ytId}" class="fab fa-youtube player-icon"></i></a>`
    }
    

    $(`#q-target`).html(mainScript)

    for(i = 0; i < shuffled.length; i++) {
        // Remove answer class used in previous quizw
        $(`#ch-${i+1}`).removeClass('answer')

        if (answer == shuffled[i][1][wantedKey]) {
            $(`#ch-${i+1}`).addClass("answer")    
        }
        $(`#ch-${i+1}`).css('background-color', '')
        $(`#ch-${i+1} .main-script`).html(shuffled[i][1][wantedKey])
        $(`#ch-${i+1} .main-script`).css('visibility', 'hidden');

        $(`#ch-${i+1} .upn`).html(shuffled[i][1][upnKey])
        $(`#ch-${i+1} .lon`).html(shuffled[i][1][lonKey])
    }
}