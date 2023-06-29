import { constants as consts, ships, sounds } from "./constants.js"

// shows historic game statistics in the console
export { getStatistics, resetStatistics, checkScore }

function getStatistics() {
    let _oStats = JSON.parse(localStorage.getItem('gamestats'))
    return _oStats
}

// resets historic stats
function resetStatistics() {
    localStorage.removeItem('gamestats')
}

function checkScore() {
    ships.forEach((ship) => {
        if (gameState.player.hits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {
            let computerShipList = document.querySelector('#computerSide .shipList').getElementsByClassName(`${ship.name}`);
            computerShipList[0].classList.add('sunk')
            if (gameState.computer.shipsSunk.indexOf(ship.name) == -1) {
                // sounds.sinkSound.play();
                gameState.computer.shipsSunk.push(ship.name);
            }
        }
        if (gameState.computer.hits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {
            let playerShipList = document.querySelector('#playerSide .shipList').getElementsByClassName(`${ship.name}`);
            playerShipList[0].classList.add('sunk')
            if (gameState.player.shipsSunk.indexOf(ship.name) == -1) {
                // sounds.sinkSound.play();
                gameState.player.shipsSunk.push(ship.name);
            }
        }
    })

    // update score stats
    let maxHits = 17;
    gameState.computer.hitPercentage = Math.round((gameState.computer.hits.length / gameState.round) * 100);
    gameState.computer.score = Math.round((gameState.computer.hitPercentage / consts.DUCKY_THRESHOLD) * 100)
    gameState.player.hitPercentage = Math.round((gameState.player.hits.length / gameState.round) * 100)
    gameState.player.score = Math.round((gameState.player.hitPercentage / consts.DUCKY_THRESHOLD) * 100)

    if (gameState.player.shipsSunk.length === 5) {
        _lose()
    }
    if (gameState.computer.shipsSunk.length === 5) {
        _win()
    }
}


//Open the correct page's when the player wins or loses
function _win() {
    _recordScore()
    gameState.gameOver = true;
    if (gameState.player.hitPercentage >= consts.DUCKY_THRESHOLD) {
        window.open("../pages/winrubberduck.html?win-score=" + gameState.player.score, "_self");
    } else {
        window.open("../pages/win.html?win-score=" + gameState.player.score, "_self");
    }
}
function _lose() {
    _recordScore()
    gameState.gameOver = true;
    window.open("../pages/gameover.html", "_self");
}

// appends the score of the game to local storage
function _recordScore() {
    let _oGameStats = getStatistics();

    if (!_oGameStats) {
        _oGameStats = {
            'total games enjoyed': 0,
            'wins': 0,
            'duckies': 0, //special kind of win
            'losses': 0,
            'highest score': 0,
            'average score': 0,
            'average game time': 0,
            'longest game time': 0,
            'shortest game time': 36000, // 10 hours :)
            'average no. rounds': 0,
            'most rounds': 0,
            'least rounds': 100 // maximum possible rounds for 10x10
        }
    }

    let _nGames = ++_oGameStats['total games enjoyed']
    let _nDuration = (Date.now() - gameState.startTime) / 1000 //in seconds
    let _nPlayerScore = gameState.player.score
    let _nRounds = gameState.round

    let _bResult = (gameState.computer.shipsSunk.length === 5) ? ++_oGameStats['wins'] : ++_oGameStats['losses']

    if (_bResult && (gameState.player.hitPercentage >= consts.DUCKY_THRESHOLD)) {
        ++_oGameStats['duckies']
    }

    // score
    if (_nPlayerScore > _oGameStats["highest score"]) _oGameStats["highest score"] = _nPlayerScore

    // time
    if (_nDuration > _oGameStats["longest game time"]) _oGameStats["longest game time"] = _nDuration
    if (_nDuration < _oGameStats["shortest game time"]) _oGameStats["shortest game time"] = _nDuration

    // rounds
    if (_nRounds > _oGameStats["most rounds"]) _oGameStats["most rounds"] = _nRounds
    if (_nRounds < _oGameStats["least rounds"]) _oGameStats["least rounds"] = _nRounds

    // recalculate averages
    _oGameStats["average score"] = ((_oGameStats["average score"] * (_nGames - 1)) + _nPlayerScore) / _nGames
    _oGameStats["average game time"] = ((_oGameStats["average game time"] * (_nGames - 1)) + _nDuration) / _nGames
    _oGameStats["average no. rounds"] = ((_oGameStats["average no. rounds"] * (_nGames - 1)) + _nRounds) / _nGames

    localStorage.setItem('gamestats', JSON.stringify(_oGameStats))

}