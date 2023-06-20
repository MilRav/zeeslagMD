import { getStatistics } from './score.js'
//btns
let _btnStart = document.getElementById('btnNewGame')
_btnStart.onclick = newGame

let _elExplainer = document.getElementById('duckyExplainer')
let _elCloseExplainer = document.querySelector('#duckyExplainerModal span.close')

// When the user clicks the ship, open the corresponding modal
_elExplainer.onclick = function() {
    var modal = document.getElementById('duckyExplainerModal');
    modal.style.display = "flex";
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
let _elStatsPart = document.querySelector('.gameStatistics table')
let _elStatsHeader = document.querySelector('.statsHeader')

if (_elStatsPart) {
    if (_oTheStats) {
        _elStatsHeader.classList.remove('hide')

        _appendStatsData("Aantal spellen genoten", _oTheStats["total games enjoyed"])
        _appendStatsData("Gewonnen", _oTheStats["wins"])
        _appendStatsData("Verloren", _oTheStats["losses"])
        _appendStatsData("Hoogste score", _oTheStats["highest score"])
        _appendStatsData("Duckies gewonnen", _oTheStats["duckies"])

    }
    else {
        // no stats yet: hide header
        _elStatsHeader.classList.add('hide')
    }
}

function _appendStatsData (_sRowText, _sRowNumber) {
        // create individual elements for render
        let _elRow = document.createElement("tr")
        let _elText = document.createElement("td")
        let _elNumber = document.createElement("td")

        _elText.textContent = _sRowText
        _elNumber.textContent = _sRowNumber

        _elRow.appendChild(_elText)
        _elRow.appendChild(_elNumber)
        _elStatsPart.appendChild(_elRow)
}

function newGame(){
    window.open("/pages/game.html","_self")
}