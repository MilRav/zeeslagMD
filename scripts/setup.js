import { startGame, setInfoText } from "./game.js";
import { constants, constants as consts, ships } from "./constants.js" 

// board
const flipButton = document.querySelector("#flipButton")
const infoButton = document.querySelector("#infoButton")
const startButton = document.querySelector("#startButton")
const width = consts.BOARD_WIDTH

// vars
let draggedShip
let angle = 0
let notDropped

//global
window.gameState = {
    startTime: undefined,
    round: 0,
    gameOver: false,
    playerTurn: undefined,
    difficulty: consts.DEFAULT_DIFFICULTY,
    debug: false,
    player: {
        hits: [],
        shipsSunk: [],
        hitPercentage: 0,
        score: 0
    },
    computer: {
        hits: [],
        shipsSunk: [],
        hitPercentage: 0,
        score: 0
    }
}

/* SETUP BOARDS */
document.querySelector('#gameContainer').classList.add('setup')

createBoard("player");
createBoard("computer");
const allPlayerBlocks = document.querySelectorAll("#player div");
const playerBoard = document.querySelector('#player');

startButton.classList.add('hide');
ships.forEach((ship) => addShipPiece("computer", ship));

setSetupEventListeners()

/* ADD EVENT LISTENERS */
function setSetupEventListeners () {
    flipButton.addEventListener("click", flip);
    infoButton.addEventListener("click", openInfoPage);
    startButton.addEventListener("click", startTheGame);

    allPlayerBlocks.forEach((playerBlock) => {
        playerBlock.addEventListener("dragover", dragOver)
        playerBlock.addEventListener("drop", dropShip)
    });
    playerBoard.addEventListener('dragleave', dragLeave);
    document.addEventListener('dragstart', dragStart);
}
function removeSetupEventListeners () {
    flipButton.removeEventListener("click", flip);
    startButton.removeEventListener("click", startTheGame);

    allPlayerBlocks.forEach((playerBlock) => {
        playerBlock.removeEventListener("dragover", dragOver)
        playerBlock.removeEventListener("drop", dropShip)
    });
    playerBoard.removeEventListener('dragleave', dragLeave);
    document.removeEventListener('dragstart', dragStart);
}

setInfoText("Plaats je schepen door ze naar het bord te slepen.")

/* FUNCTIONS */
function startTheGame (){
    removeSetupEventListeners()
    startGame()
}

//Open info page
function openInfoPage(){
    window.open("../pages/info.html", '_blank').focus();
}

//Flip the preview of ships
function flip() {
    angle = angle === 0 ? 90 : 0;

    const _elPlayerShipList = document.querySelector('#playerSide .shipList');
    _elPlayerShipList.classList.remove(angle === 90 ? 'horizontal' : 'vertical')
    _elPlayerShipList.classList.add(angle === 0 ? 'horizontal' : 'vertical')
}

//Create a 10 * 10 gameboard
function createBoard(user) {
    sessionStorage.removeItem('droppedShips');
    const gameBoard = document.querySelector(`#${user}.gameBoard`)
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement("div");
        block.classList.add("block");
        block.id = i;
        gameBoard.append(block);
    }
}

//Check if a ship has a correct spot
function checkPlacement(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = startIndex;
    let shipBlocks = [];
    let valid;

    // check for placement bounds
    if (isHorizontal) {
        let startRow = Math.floor(startIndex / width)
        let endRow = Math.floor(((startIndex + ship.length) / width))
        if (startRow != endRow) {
            // This means we are out-of-bounds (ship crosses into new row). Adjust startIndex.
            let adjusting = (((startIndex + ship.length) % 10))
            validStart = startIndex - adjusting
        }
    } else {
        let startRow = Math.floor(startIndex / width)
        let endRow = startRow + ship.length
        if (endRow >= width) {
            let adjusting = (endRow - width)
            validStart = startIndex - (adjusting * width)
        }
    }

    // make list of blocks
    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width]);
        }
    }

    if (isHorizontal) {
        shipBlocks.every(
            (_shipBlock, index) =>
            (valid =
                shipBlocks[0].id % width !==
                width - (shipBlocks.length - (index + 1)))
        );
    } else {
        shipBlocks.every(
            (_shipBLock, index) =>
                (valid = shipBlocks[0].id < 90 + (width * index + 1))
        );
    }
    const notTaken = shipBlocks.every(
        (shipBlock) => !shipBlock.classList.contains("taken") || (shipBlock.classList.contains('taken') && shipBlock.classList.contains(ship.name))
    );
    return { shipBlocks, valid, notTaken };
}

//Add a ship piece to the player or computers board
function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`);
    let randomBoolean = Math.random() < 0.5;
    let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
    let randomStartIndex = Math.floor(Math.random() * width * width);
    let startIndex = startId ? Number(startId) : randomStartIndex;
    const { shipBlocks, valid, notTaken } = checkPlacement(allBoardBlocks, isHorizontal, startIndex, ship);
    if (valid && notTaken) {
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add("taken");
            if (user === "player") shipBlock.classList.add("draggable");
        });
    } else {
        if (user === "computer") addShipPiece("computer", ship, startId);
        if (user === "player") notDropped = true;
    }
}
//Remove a ship piece from the player board (computer does not need this)
function removeShipPiece(ship) {
    const shipBlocks = document.querySelectorAll(`#player div.${ship.name}`);
    shipBlocks.forEach((shipBlock) => {
        shipBlock.classList.remove(ship.name);
        shipBlock.classList.remove("taken");
        shipBlock.classList.remove("draggable");
    });
}

// Drag and drop functions 
function dragLeave(e) {
    removeHighlightArea();
}

function dragStart(e) {
    console.log("started draging: " + e)
    draggedShip = ""
    if (!e.srcElement.classList.contains('draggable')) {
        e.preventDefault();
        return
    }
    //Are we repositioning a ship?
    allPlayerBlocks.forEach((shipBlock) => {
        if (shipBlock == e.srcElement) {
            notDropped = false;
            draggedShip = ""
            e.target.classList.forEach((classItem) => {
                let _oTheShip = ships.find(ship => ship.name == classItem)

                if (_oTheShip) {
                    draggedShip = _oTheShip //this now functions like the option container div :)
                }
            })
        }
    });
    notDropped = false;
    if (!draggedShip) {
        draggedShip = ships.filter(obj => { return obj.id === e.target.id })[0];
    }
}

function dragOver(e) {
    e.preventDefault();
    highlightArea(e.target.id, draggedShip);
}

function dropShip(e) {
    const targetError = document.querySelectorAll('#player .error');
    if (targetError.length > 0) {
        removeHighlightArea();

        return
    }
    let _oDroppedShipsFromSession = JSON.parse(sessionStorage.getItem('droppedShips'));
    let droppedShips = [];
    if (_oDroppedShipsFromSession !== undefined && _oDroppedShipsFromSession !== null) {
        droppedShips = _oDroppedShipsFromSession;
    }

    if (droppedShips.includes(draggedShip.id)) {
        removeShipPiece(draggedShip)
    }

    const startId = e.target.id;

    addShipPiece("player", draggedShip, startId);
    if (!notDropped) {
        droppedShips.push(draggedShip.id);
        sessionStorage.setItem('droppedShips', JSON.stringify(droppedShips));
        let _elShipPiece = document.querySelector(`#playerSide .shipList .${draggedShip.name}`)
        if (_elShipPiece) _elShipPiece.classList.add('placed')

    }
    removeHighlightArea();
    draggedShip = ""

    // check if all ships are dropped and unhide start button
    let _elPlacedShips = document.querySelectorAll('#playerSide .placed')
    if (_elPlacedShips.length == 5) startButton.classList.remove('hide')
}


// hover
//Add highlight
function highlightArea(startId, ship) {
    const allBoardBlocks = document.querySelectorAll("#player div");
    const allHoverBlocks = document.querySelectorAll("#player div.hover");
    let isHorizontal = angle === 0;
    let _aHoverBlocks = []

    const { shipBlocks, valid, notTaken } = checkPlacement(
        allBoardBlocks,
        isHorizontal,
        Number(startId),
        ship
    );

    if (valid && notTaken) {
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add("hover");
            _aHoverBlocks.push(shipBlock.id);
        });
    } else {
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add("hover");
            shipBlock.classList.add("error");
            _aHoverBlocks.push(shipBlock.id);
        });
    }


    //remove other hover marked blocks
    allHoverBlocks.forEach((_elBlock) => {
        if (_aHoverBlocks) {
            if (!_aHoverBlocks.includes(_elBlock.id)) {
                _elBlock.classList.remove("hover");
                _elBlock.classList.remove("error");
            }
        } else {
            _elBlock.classList.remove("hover");
            _elBlock.classList.remove("error");
        }
    });
}

function removeHighlightArea() {
    //remove hover class
    const allHoverBlocks = document.querySelectorAll("#player div.hover");
    allHoverBlocks.forEach((_elBlock) => {
        _elBlock.classList.remove("hover");
        _elBlock.classList.remove("error");
    });
}