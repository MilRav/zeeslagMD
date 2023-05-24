function checkScore() {
    ships.forEach((ship) => {
        if (gameStats.playerHits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {
            infoDisplay.textContent = `you sunk the computers's ${ship.name}`;
            console.log(ship.name)
            let computerShipList = document.getElementById('computerShipList').getElementsByClassName(`${ship.name}`);
            computerShipList[0].classList.add('sunk')
            if (gameStats.computerSunkShips.indexOf(ship.name) == -1) {
                gameStats.computerSunkShips.push(ship.name);
            }
        }
        if (gameStats.computerHits.filter(storedShipName => storedShipName === ship.name).length === ship.length) {   
            infoDisplay.textContent = `the computer sunk the players's ${ship.name}`;
            let playerShipList = document.getElementById('playerShipList').getElementsByClassName(`${ship.name}`);
            playerShipList[0].classList.add('sunk')
            if (gameStats.playerSunkShips.indexOf(ship.name) == -1) {
                gameStats.playerSunkShips.push(ship.name);
            }
        }
    })

    // update score stats
    let maxHits = 17; 
    gameStats.computerHitPercentage = Math.round((gameStats.computerHits.length / gameStats.round) * 100);
    gameStats.playerHitPercentage = Math.round((gameStats.playerHits.length / gameStats.round) * 100);

    if (gameStats.playerSunkShips.length === 5) {
        lose()
    }
    if (gameStats.computerSunkShips.length === 5) {
        win()
    }
}


//Open the correct page's when the player wins or loses
function win() {
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    gameStats.gameOver = true;
    window.open("../pages/win.html?win-score=" + gameStats.playerHitPercentage, "_self");
    //TODO: if percentage is high enough -> ducky!
}
function lose() {
    infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
    gameStats.gameOver = true;
    window.open("../pages/gameover.html", "_self");
}


