//Event listeners
startButton.addEventListener("click", startGame);


// Start Game
function startGame() {
    if (playerTurn === undefined) {
        if (optionContainer.children.length != 0) {
            infoDisplay.textContent = "Please place all your pieces first!";
        } else {
            const allBoardBlocks = document.querySelectorAll("#computer div");
            allBoardBlocks.forEach((block) =>
                block.addEventListener("click", handleClick));
            playerTurn = true;
            turnDisplay.textContent = 'Your Go!';
            infoDisplay.textContent = 'The game has started!';
        }

    }
}
//Check the selected block and change values
function handleClick(e) {
    if (!gameOver) {
        roundCount++;
        if (e.target.classList.contains("taken")) {
            e.target.classList.add("boom");
            infoDisplay.textContent = "You hit this computers ship!";
            let classes = Array.from(e.target.classList);
            classes = classes.filter((className) => className !== "block");
            classes = classes.filter((className) => className !== "boom");
            classes = classes.filter((className) => className !== "taken");
            playerHits.push(...classes);
            checkScore('player', playerHits, playerSunkShips);
        }
        if (!e.target.classList.contains("taken")) {
            infoDisplay.textContent = "Nothing hit this time.";
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
        turnDisplay.textContent = 'Computers Go!';
        infoDisplay.textContent = "The computer is thinking...";
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
            turnDisplay.textContent = "Your Go!";
            infoDisplay.textContent = "Please take your go.";
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
        infoDisplay.textContent = "The computer hit your ship!";
        let classes = Array.from(allPlayerBlocks[blockID].classList);
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        computerHits.push(...classes);
        checkScore('computer', computerHits, computerSunkShips);
    } else {
        infoDisplay.textContent = "Nothing hit this time.";
        allPlayerBlocks[blockID].classList.add("empty");
    }
}
// find an obvious target: this is any block that is adjecent to a hit and has not been checked
function findObviousTarget() {
    let targetBlockId = -1;
    for (let i = 0; i < allPlayerBlocks.length; i++) {
        if (allPlayerBlocks[i].classList.contains("boom")) {
            let blockIdsToCheck = [
                i - 1,   // check left
                i + 1,   // check right
                i - width,  // check up
                i + width  // check down
            ];
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
    let cheatAllowed = Math.floor(Math.random() * 1) == 0;
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