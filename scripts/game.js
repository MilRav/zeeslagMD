// Start Game
function startGame() {
    
    if (gameStats.playerTurn === undefined) {
        let _oDroppedShipsFromSession = JSON.parse(sessionStorage.getItem('droppedShips'));
        let droppedShips = [];
        if (_oDroppedShipsFromSession !== undefined && _oDroppedShipsFromSession !== null) {
            droppedShips = _oDroppedShipsFromSession;
        }
        if (droppedShips.length < 5) {
            infoDisplay.textContent = "Plaats eerst al je schepen!";
        } else {
            // add and remove event listeners
            document.querySelectorAll("#computer div").forEach((block) =>
                block.addEventListener("click", handleClick));

            document.querySelectorAll("#player div").forEach((block) => {
                block.removeEventListener("dragstart",dragStart)
                block.removeEventListener("dragover",dragOver)
                block.removeEventListener("drop",dropShip)
            });

            document.querySelector('#playerSide .shipList').classList.remove('vertical')

            flipButton.classList.add('hide')

            // remove draggables
            document.querySelectorAll('.draggable').forEach((element) =>
                element.classList.remove('draggable'))
            // remove placed (setup phase)
            document.querySelectorAll('.placed').forEach((element) =>
                element.classList.remove('placed'))

            let _elContainer = document.querySelector('#gameContainer');
            _elContainer.classList.remove('setup')
            _elContainer.classList.add('playing')
            
            gameStats.playerTurn = true;
            infoDisplay.textContent = 'Het spel is begonnen!';
        }

    }
}
//Check the selected block and change values
function handleClick(e) {
    if (!gameStats.gameOver) {
        gameStats.round++;
        if (e.target.classList.contains("taken")) {
            e.target.classList.add("boom");
            infoDisplay.textContent = "Je hebt een schip geraakt!";
            let classes = Array.from(e.target.classList);
            classes = classes.filter((className) => className !== "block");
            classes = classes.filter((className) => className !== "boom");
            classes = classes.filter((className) => className !== "taken");
            gameStats.player.hits.push(...classes);
        }
        if (!e.target.classList.contains("taken")) {
            infoDisplay.textContent = "Je hebt niks geraakt.";
            e.target.classList.add("empty");
        }
        checkScore();
        gameStats.playerTurn = false;
        const allBoardBlocks = document.querySelectorAll("#computer div");
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
        setTimeout(computerTurn, 50);
    }
}

// Define the computers go
function computerTurn() {
    if (!gameStats.gameOver) {
        setTurnIndicator()
        infoDisplay.textContent = "Guardion is aan het denken...";
        //computer turn
        setTimeout(() => {
            // first find an "obvious target"
            targetBlockId = findObviousTarget();
            if (targetBlockId == -1) {
                // no obvious target, so try random instead
                targetBlockId = findRandomTarget();
            }
            engageTarget(targetBlockId);
        }, 25);
        //adjust difficulty
        adjustDifficulty()
        //player turn
        setTimeout(() => {
            gameStats.playerTurn = true;
            setTurnIndicator()
            infoDisplay.textContent = "Jouw beurt.";
            const allBoardBlocks = document.querySelectorAll("#computer div");
            allBoardBlocks.forEach((block) =>
                block.addEventListener("click", handleClick)
            );
        }, 100);
    }
}
// "fire" at a certain target block
function engageTarget(blockID) {
    if (
        allPlayerBlocks[blockID].classList.contains("taken") &&
        !allPlayerBlocks[blockID].classList.contains("boom")
    ) {
        allPlayerBlocks[blockID].classList.add("boom");
        infoDisplay.textContent = "Guardian heeft jou schip geraakt!";
        let classes = Array.from(allPlayerBlocks[blockID].classList);
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        gameStats.computer.hits.push(...classes);
        checkScore();
    } else {
        infoDisplay.textContent = "Er is niks geraakt.";
        allPlayerBlocks[blockID].classList.add("empty");
    }
}
// find an obvious target: this is any block that is adjecent to a hit and has not been checked
function findObviousTarget() {
    let targetBlockId = -1;
    
    for (let i = 0; i < allPlayerBlocks.length; i++) {
        if (allPlayerBlocks[i].classList.contains("boom")) {
            let blockIdsToCheck = [];
            // check left
            if (i % width !== 0) {
              blockIdsToCheck.push(i - 1);
            }
            // check right
            if (i % width !== width - 1) {
              blockIdsToCheck.push(i + 1);
            }
            // check up
            if (i >= width) {
              blockIdsToCheck.push(i - width);
            }
            // check down
            if (i < width * (width - 1)) {
              blockIdsToCheck.push(i + width);
            }
            for (let j = 0; j < blockIdsToCheck.length; j++) {
                let blockId = blockIdsToCheck[j];
                if (blockId >= 0 && blockId < allPlayerBlocks.length && !allPlayerBlocks[blockId].classList.contains("boom") && !allPlayerBlocks[blockId].classList.contains("empty")) {
                    targetBlockId = blockId;
                    break;
                }
            }
            if (targetBlockId !== -1) break;
        }
    }
    return targetBlockId;
}
// generate a random, empty, target
function findRandomTarget() {
    let cheatAllowed = Math.floor(Math.random() * gameStats.difficulty) == 0;
    let blockId = 0
    if (cheatAllowed) {
        // give the computer an actual player ship block
        let _aPlayerTakenNotBoom = document.querySelectorAll('#player .taken:not(.boom)')
        blockId = _aPlayerTakenNotBoom ? _aPlayerTakenNotBoom[0].id : blockId;
    } else {
        // not cheating, so select random block
        blockId = Math.floor(Math.random() * width * width);
        if (
            allPlayerBlocks[blockId].classList.contains("empty") ||
            allPlayerBlocks[blockId].classList.contains("boom")
        ) {
            // if this is not an unknown block, retry until we get one
            blockId = findRandomTarget();
        }
    }
    return blockId
}
// adjusts the amount of luck the computer has when finding a random target (aka how often the computer cheats :) )
function adjustDifficulty() {
    let _nScoreDiff = gameStats.computer.hits.length - gameStats.player.hits.length

    if (Math.abs(_nScoreDiff) >= DIFFICULTY_THRESHOLD) {
        // score difference is large enough to adjust the difficulty
        gameStats.difficulty = _nScoreDiff < 0 ? HARD_DIFFICULTY : EASY_DIFFICULTY
    } else {
        // set difficulty to default
        gameStats.difficulty = DEFAULT_DIFFICULTY
    }
}

function setTurnIndicator() {
    if (gameStats.playerTurn) {
        document.querySelector('#computerSide').classList.remove('turn')
        document.querySelector('#playerSide').classList.add('turn')
    } else {
        document.querySelector('#playerSide').classList.remove('turn')
        document.querySelector('#computerSide').classList.add('turn')
    }
}