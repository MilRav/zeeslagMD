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
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    gameStats.gameOver = true;
    if (gameStats.player.hitPercentage >= DUCKY_THRESHOLD) {
        window.open("../pages/winrubberduck.html?win-score=" + gameStats.player.hitPercentage, "_self");
    } else {
        window.open("../pages/win.html?win-score=" + gameStats.player.hitPercentage, "_self");
    }
}
function lose() {
    infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
    gameStats.gameOver = true;
    window.open("../pages/gameover.html", "_self");
}


