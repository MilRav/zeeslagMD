//Event listeners
startButton.addEventListener("click", startGame);


// Start Game
function startGame() {
    if (playerTurn === undefined) {
        if (optionContainer.children.length != 0) {
            infoDisplay.textContent = "Plaats eerst al je schepen!";
        } else {
            // add and remove event listeners
            const allComputerBoardBlocks = document.querySelectorAll("#computer div");
            const allPlayerBoardBlocks = document.querySelectorAll("#player div");
            allComputerBoardBlocks.forEach((block) =>
                block.addEventListener("click", handleClick));

            allPlayerBoardBlocks.forEach((block) => {
                block.removeEventListener("dragstart",dragStart)
                block.removeEventListener("dragover",dragOver)
                block.removeEventListener("drop",dropShip)
            });

            let _elContainer = document.querySelector('#gameContainer');
            _elContainer.classList.remove('setup')
            _elContainer.classList.add('playing')
            
            document.querySelector('#gameContainer .container').classList.add('hide')
            document.querySelector('#startButton').classList.add('hide')

            playerTurn = true;
            turnDisplay.textContent = 'Jou beurt!';
            infoDisplay.textContent = 'Het spel is begonnen!';
            hideElement()
        }

    }
}
//Check the selected block and change values
function handleClick(e) {
    if (!gameOver) {
        roundCount++;
        if (e.target.classList.contains("taken")) {
            e.target.classList.add("boom");
            infoDisplay.textContent = "Je hebt een schip geraakt!";
            let classes = Array.from(e.target.classList);
            classes = classes.filter((className) => className !== "block");
            classes = classes.filter((className) => className !== "boom");
            classes = classes.filter((className) => className !== "taken");
            playerHits.push(...classes);
            checkScore('player', playerHits, playerSunkShips);
        }
        if (!e.target.classList.contains("taken")) {
            infoDisplay.textContent = "Je hebt niks geraakt.";
            e.target.classList.add("empty");
        }
        playerTurn = false;
        const allBoardBlocks = document.querySelectorAll("#computer div");
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
        setTimeout(computerGo, 50);
    }
}

// Define the computers go
function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = 'Guardian\'s beurt!';
        infoDisplay.textContent = "Guardian is aan het denken...";
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
        //player turn
        setTimeout(() => {
            playerTurn = true;
            turnDisplay.textContent = "Jou beurt!";
            infoDisplay.textContent = "Neem je beurt.";
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
        computerHits.push(...classes);
        checkScore('computer', computerHits, computerSunkShips);
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
    let cheatAllowed = Math.floor(Math.random() * 8) == 0;
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