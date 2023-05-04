//Check the player's final score
function score() {
    let totaal = roundCount;
    let maxHits = 17;
    let procent = Math.round((maxHits / totaal) * 100);
    //console.log("Score: " + procent + " %"); 
    return procent;
}
function checkScore(user, userHits, userSunkShips) {
    function checkShip(shipName, shipLength) {
        if (
            userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
        ) {
            if (user === 'player') {
                infoDisplay.textContent = `you sunk the computers's ${shipName}`;
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName);
            }
            if (user === 'computer') {
                infoDisplay.textContent = `the computer sunk the players's ${shipName}`;
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName);
            }
            userSunkShips.push(shipName);
        }
        if (playerSunkShips.length === 5) {
            infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
            gameOver = true;
            let winscore = score();
            window.open("../pages/win.html?win-score=" + winscore, "_self")
        }
        if (computerSunkShips.length === 5) {
            infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
            gameOver = true;
            window.open("../pages/gameover.html", "_self")
        }
    }
    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)
}



//Open the correct page's when the player wins or loses
function win() {
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    gameOver = true;
    // if (score => 80) {
    //     location.replace("../pages/winrubberduck.html?win-score=" + winscore,"_self");
    // } else { 
    //     window.open("../pages/win.html?win-score=" + winscore,"_self");
    // }
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    window.open("../pages/win.html?win-score=" + winscore, "_self");
}
function lose() {
    infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
    gameOver = true;
    window.open("../pages/gameover.html", "_self");
}


