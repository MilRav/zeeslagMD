function checkScore() {
    ships.forEach((ship) => {
        if (gameStats.player.hits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {
            let computerShipList = document.querySelector('#computerSide .shipList').getElementsByClassName(`${ship.name}`);
            computerShipList[0].classList.add('sunk')
            if (gameStats.computer.shipsSunk.indexOf(ship.name) == -1) {
                sinkSound.play();
                gameStats.computer.shipsSunk.push(ship.name);
            }
        }
        if (gameStats.computer.hits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {   
            let playerShipList = document.querySelector('#playerSide .shipList').getElementsByClassName(`${ship.name}`);
            playerShipList[0].classList.add('sunk')
            if (gameStats.player.shipsSunk.indexOf(ship.name) == -1) {
                sinkSound.play();
                gameStats.player.shipsSunk.push(ship.name);
            }
        }
    })

    // update score stats
    let maxHits = 17; 
    gameStats.computer.hitPercentage = Math.round((gameStats.computer.hits.length / gameStats.round) * 100);
    gameStats.player.hitPercentage = Math.round((gameStats.player.hits.length / gameStats.round) * 100);

    if (gameStats.player.shipsSunk.length === 5) {
        lose()
    }
    if (gameStats.computer.shipsSunk.length === 5) {
        win()
    }
}


//Open the correct page's when the player wins or loses
function win() {
    recordScore()
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    gameStats.gameOver = true;
    if (gameStats.player.hitPercentage >= DUCKY_THRESHOLD) {
        window.open("../pages/winrubberduck.html?win-score=" + gameStats.player.hitPercentage, "_self");
    } else {
        window.open("../pages/win.html?win-score=" + gameStats.player.hitPercentage, "_self");
    }
}
function lose() {
    recordScore()
    infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
    gameStats.gameOver = true;
    window.open("../pages/gameover.html", "_self");
}

// appends the score of the game to local storage
function recordScore(){
    let _oGameStats = JSON.parse(localStorage.getItem('gamestats'));

    if (!_oGameStats){
        _oGameStats = {
            'total games enjoyed': 0,
            'wins': 0,
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
    let _nDuration = (Date.now() - gameStats.startTime)/1000 //in seconds
    let _nPlayerScore = gameStats.player.hitPercentage
    let _nRounds = gameStats.round

    let _bResult = (gameStats.computer.shipsSunk.length === 5) ? ++_oGameStats['wins'] : ++_oGameStats['losses']

    // score
    if (_nPlayerScore > _oGameStats["highest score"]) _oGameStats["highest score"] = _nPlayerScore

    // time
    if (_nDuration > _oGameStats["longest game time"]) _oGameStats["longest game time"] = _nDuration
    if (_nDuration < _oGameStats["shortest game time"]) _oGameStats["shortest game time"] = _nDuration

    // rounds
    if (_nRounds > _oGameStats["most rounds"]) _oGameStats["most rounds"] = _nRounds
    if (_nRounds < _oGameStats["least rounds"]) _oGameStats["least rounds"] = _nRounds

    // recalculate averages
    _oGameStats["average score"] =  ( (_oGameStats["average score"] * (_nGames-1)) + _nPlayerScore) /  _nGames
    _oGameStats["average game time"] =  ( (_oGameStats["average game time"] * (_nGames-1)) + _nDuration) /  _nGames
    _oGameStats["average no. rounds"] = ( (_oGameStats["average no. rounds"] * (_nGames-1)) + _nRounds) /  _nGames

    localStorage.setItem('gamestats', JSON.stringify(_oGameStats))

}

// shows historic game statistics in the console
function gameStatistics(){
    let _oStats = JSON.parse(localStorage.getItem('gamestats'))
    return _oStats
}

// resets historic stats
function resetStatistics(){
    localStorage.removeItem('gamestats')
}