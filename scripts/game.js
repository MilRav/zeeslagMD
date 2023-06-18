import { checkScore } from "./score.js"
import { constants as consts, ships, sounds } from "./constants.js" 

let allPlayerBlocks;
let gameState;
// audio

const width = consts.BOARD_WIDTH

window.enableDebugMode = debug

//EXPORT
export {startGame, setInfoText}

// Start Game
function startGame() {
    allPlayerBlocks = document.querySelectorAll("#player div")
    gameState = window.gameState

    if (gameState.playerTurn === undefined) {
        let _oDroppedShipsFromSession = JSON.parse(sessionStorage.getItem('droppedShips'));
        let droppedShips = [];
        if (_oDroppedShipsFromSession !== undefined && _oDroppedShipsFromSession !== null) {
            droppedShips = _oDroppedShipsFromSession;
        }
        if (droppedShips.length < 5) {
            setInfoText("Plaats eerst al je schepen!")
        } else {
            // add and remove event listeners
            document.querySelectorAll("#computer div").forEach((block) =>
                block.addEventListener("click", handleClick));

            document.querySelector('#playerSide .shipList').classList.remove('vertical')

            flipButton.classList.add('hide')
            startButton.classList.add('hide');

            // remove draggables
            document.querySelectorAll('.draggable').forEach((element) =>
                element.classList.remove('draggable'))
            // remove placed (setup phase)
            document.querySelectorAll('.placed').forEach((element) =>
                element.classList.remove('placed'))

            let _elContainer = document.querySelector('#gameContainer');
            _elContainer.classList.remove('setup')
            _elContainer.classList.add('playing')
            gameState.startTime = Date.now();
            gameState.playerTurn = true;
            setInfoText('Het spel is begonnen! Kies een vakje om aan te vallen.')
            setTurnIndicator();
        }

    }
}
//Check the selected block and change values
function handleClick(e) {
    if (!gameState.gameOver) {
        gameState.round++;
        if (e.target.classList.contains("taken")) {
            sounds.hitSound.play();
            e.target.classList.add("boom");
            setInfoText("Je hebt een schip geraakt!");
            let classes = Array.from(e.target.classList);
            classes = classes.filter((className) => className !== "block");
            classes = classes.filter((className) => className !== "boom");
            classes = classes.filter((className) => className !== "taken");
            classes = classes.filter((className) => className !== "debug");
            gameState.player.hits.push(...classes);
        }
        if (!e.target.classList.contains("taken")) {
            setInfoText("Je hebt niks geraakt.")
            e.target.classList.add("empty");
        }
        checkScore();
        gameState.playerTurn = false;
        const allBoardBlocks = document.querySelectorAll("#computer div");
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
        let _nDelay  = gameState.debug ? 10 : consts.AFTER_TURN_TIME
        setTimeout(computerTurn, _nDelay);
    }
}

// Define the computers go
function computerTurn() {
    if (!gameState.gameOver) {
        setTurnIndicator()
        setInfoText("Guardion is aan het denken...")

        // Calculate turn delay based on debug mode
        const turnDelay = gameState.debug ? consts.DEBUG_SPEED : consts.NORMAL_SPEED();

        // Computer turn
        setTimeout(() => {
            // First find an "obvious target"
            let targetBlockId = findObviousTarget();
            if (targetBlockId === -1) {
                // No obvious target, so try random instead
                targetBlockId = findRandomTarget();
            }
            engageTarget(targetBlockId);

            // Adjust difficulty
            adjustDifficulty();

            // Player turn
            let _nDelay  = gameState.debug ? 10 : consts.AFTER_TURN_TIME
            setTimeout(() => {
                gameState.playerTurn = true;
                setTurnIndicator();
                setInfoText("Jouw beurt");

                const allBoardBlocks = document.querySelectorAll("#computer div");
                allBoardBlocks.forEach((block) =>
                    block.addEventListener("click", handleClick)
                );
            }, _nDelay);
        }, turnDelay);
    }
}
// "fire" at a certain target block
function engageTarget(blockID) {
    if (
        allPlayerBlocks[blockID].classList.contains("taken") &&
        !allPlayerBlocks[blockID].classList.contains("boom")
    ) {
        sounds.hitSound.play();
        allPlayerBlocks[blockID].classList.add("boom");
        setInfoText("Guardion heeft jou schip geraakt!")
        let classes = Array.from(allPlayerBlocks[blockID].classList);
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        gameState.computer.hits.push(...classes);
        checkScore();
    } else {
        setInfoText("Er is niks geraakt.")
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
    let cheatAllowed = Math.floor(Math.random() * gameState.difficulty) == 0;
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
    let _nScoreDiff = gameState.computer.hits.length - gameState.player.hits.length

    if (Math.abs(_nScoreDiff) >= consts.DIFFICULTY_THRESHOLD) {
        // score difference is large enough to adjust the difficulty
        gameState.difficulty = _nScoreDiff < 0 ? consts.HARD_DIFFICULTY : consts.EASY_DIFFICULTY
    } else {
        // set difficulty to default
        gameState.difficulty = consts.DEFAULT_DIFFICULTY
    }
}

function setTurnIndicator() {
    if (gameState.playerTurn) {
        document.querySelector('#playerSide').classList.remove('turn')
        document.querySelector('#computerSide').classList.add('turn')
    } else {
        document.querySelector('#computerSide').classList.remove('turn')
        document.querySelector('#playerSide').classList.add('turn')
    }
}

function nuke() {
    const allComputerBlocks = document.querySelectorAll('#computer .block');
    allComputerBlocks.forEach((ship) => {
        ship.classList.add("boom");
        setTimeout(win()
            , 2000)

    })
}

// sets the info text and corresponding icon
function setInfoText(text, icon = 'info') {
    const _elInfoDisplay = document.querySelector("#gameInfo .text")
    _elInfoDisplay.textContent = text
}

function debug() {
    const computerShips = Array.from(document.querySelectorAll('#computer .taken'));
    // Enable debug mode and set the speed to DEBUG_SPEED
    gameState.debug = true;

    computerShips.forEach((ship) => {
        ship.classList.add("debug");
    });
}