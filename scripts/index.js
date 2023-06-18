import { getStatistics } from './score.js'
//btns
let _btnStart = document.getElementById('btnNewGame')
_btnStart.onclick = newGame

let _elExplainer = document.getElementById('duckyExplainer')
let _elCloseExplainer = document.querySelector('#duckyExplainerModal span.close')

// When the user clicks the ship, open the corresponding modal
_elExplainer.onclick = function() {
    var modal = document.getElementById('duckyExplainerModal');
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
_elCloseExplainer.onclick = function() {
    var modal = document.getElementById('duckyExplainerModal');
    modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
    }
};

//stats
let _oTheStats = getStatistics()
let _elStatsPart = document.querySelector('.gameStatistics')
let _elStatsHeader = document.querySelector('.statsHeader')

if (_elStatsPart) {
    if (_oTheStats) {
        _elStatsHeader.classList.remove('hide')
        // create individual elements for render
        let _elTotalRounds = document.createElement("div")
        _elTotalRounds.textContent = `Aantal spellen genoten: ${_oTheStats["total games enjoyed"]}`
        _elStatsPart.appendChild(_elTotalRounds)

        let _elWinRounds = document.createElement("div")
        _elWinRounds.textContent = `Gewonnen: ${_oTheStats["wins"]}`
        _elStatsPart.appendChild(_elWinRounds)

        let _elLossRounds = document.createElement("div")
        _elLossRounds.textContent = `Verloren: ${_oTheStats["losses"]}`
        _elStatsPart.appendChild(_elLossRounds)

        let _elHighScore = document.createElement("div")
        _elHighScore.textContent = `Hoogste score: ${_oTheStats["highest score"]}`
        _elStatsPart.appendChild(_elHighScore)

        let _elDuckies = document.createElement("div")
        _elDuckies.textContent = `Duckies gewonnen: ${_oTheStats["duckies"]}`
        _elStatsPart.appendChild(_elDuckies)
    }
    else {
        // no stats yet: hide header
        _elStatsHeader.classList.add('hide')
    }
}

function newGame(){
    window.open("/pages/game.html","_self")
}