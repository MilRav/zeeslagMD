function checkScore() {
    ships.forEach((ship) => {
        if (gameStats.player.hits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {
            infoDisplay.textContent = `you sunk the computers's ${ship.name}`;
            console.log(ship.name)
            let computerShipList = document.querySelector('#computerSide .shipList').getElementsByClassName(`${ship.name}`);
            computerShipList[0].classList.add('sunk')
            if (gameStats.computer.shipsSunk.indexOf(ship.name) == -1) {
                gameStats.computer.shipsSunk.push(ship.name);
            }
        }
        if (gameStats.computer.hits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {   
            infoDisplay.textContent = `the computer sunk the players's ${ship.name}`;
            let playerShipList = document.querySelector('#playerSide .shipList').getElementsByClassName(`${ship.name}`);
            playerShipList[0].classList.add('sunk')
            if (gameStats.player.shipsSunk.indexOf(ship.name) == -1) {
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

function recordScore(){
    let result = (gameStats.computer.shipsSunk.length === 5) ? 'win' : 'loss'
    // retreive score object from local storage
    let _oGameHistoryFromStorage = JSON.parse(localStorage.getItem('gamehistory'));
    // append this game
    if (!_oGameHistoryFromStorage){
        _oGameHistoryFromStorage = { scores: []}
    }

    _oGameHistoryFromStorage.scores.push({'time': Date.now(),
        'result': result, 
        'playerScore': gameStats.player.hitPercentage})

    localStorage.setItem('gamehistory', JSON.stringify(_oGameHistoryFromStorage))

}

// shows historic game statistics in the console
function gameStatistics(){
    let _oStats = {
        'total games enjoyed': 0,
        'wins': 0,
        'losses': 0,
        'highest score': 0,
        'average score': 0
    }

    let _oGameHistoryFromStorage = JSON.parse(localStorage.getItem('gamehistory'))
    _oGameHistoryFromStorage.scores.forEach((game) => {
        if (game.playerScore > _oStats["highest score"]) _oStats["highest score"] = game.playerScore
        _oStats["average score"] += game.playerScore
        game.result == 'win' ? _oStats["wins"]++ :  _oStats["losses"]++ 
    })

    _oStats["average score"] =  _oStats["average score"] /  _oGameHistoryFromStorage.scores.length
    _oStats["total games enjoyed"] = _oGameHistoryFromStorage.scores.length

    return _oStats
}

// resets historic stats
function resetStatistics(){
    localStorage.setItem('gamehistory', JSON.stringify( { scores: []} ))
}