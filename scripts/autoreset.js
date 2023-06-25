/*
 A module that adds an "Are you still there" dialog to a page
*/
let mainTimerId
let cancelTimerId

// in seconds
const CANCEL_TIME = 20 
const AUTO_RESET_TIME = 180

setTimer()

window.addEventListener("mousedown", function(event) {
    resetTimer()
});

function setTimer () {
    mainTimerId = setTimeout(() => {
        // call our dialog
        raiseDialog()
        console.log("this is the first message");
    }, AUTO_RESET_TIME * 1000);
}

function resetTimer () {
    clearTimeout(mainTimerId)
    setTimer()
}

async function raiseDialog() {
    let dialogHTML  = await getDialogHTML()

    // append our dialog        
    document.body.insertAdjacentHTML( 'beforeend', dialogHTML )

    let btnReset = document.querySelector('#resetDialog')
    if (btnReset) {
        btnReset.addEventListener("click", hideDialog)
    }

    let progressBar = document.getElementById("progressBar")
    progressBar.max = CANCEL_TIME
 
    cancelTimerId = setTimeout(function () {
        window.location = '../index.html'
    }, CANCEL_TIME  * 1000)

    let timeleft = CANCEL_TIME-1;
    let redirectTimer = setInterval(function () {
        if (timeleft <= 0) {
            clearInterval(redirectTimer);
        }
        progressBar.value = CANCEL_TIME - timeleft
        --timeleft
    }, 1000);
}

function hideDialog(){ 
    let _elDialog = document.querySelector('#autoreset') 
    if (_elDialog) {
        document.body.removeChild(_elDialog)
    }
    clearTimeout(cancelTimerId)
}

async function getDialogHTML() {
    let response = await fetch('../pages/autoreset_dialog.html')

    if (response.status != 200) {
        throw new Error("Server Error")
    }

    let dialog_data = await response.text()

    return dialog_data
}
