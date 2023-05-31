// SHOULD BE LOADED LAST

// board
const gamesBoardContainer = document.querySelector("#gamesBoardContainer");
const optionContainer = document.querySelector(".optionContainer");
const flipButton = document.querySelector("#flipButton");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const infoDisplay = document.querySelector("#gameInfo");
const shipList = document.querySelector('.shipList');
const width = 10;

const DEFAULT_DIFFICULTY = 8
const EASY_DIFFICULTY = 12
const HARD_DIFFICULTY = 4
const DIFFICULTY_THRESHOLD = 3
const DUCKY_THRESHOLD = 40

// ships
class Ship {
    constructor(id, name, length) {
        this.id = id;
        this.name = name;
        this.length = length;
    }
}

const submarine = new Ship("0", "submarine", 2);
const destroyer = new Ship("1", "destroyer", 3);
const cruiser = new Ship("2", "cruiser", 3);
const battleship = new Ship("3", "battleship", 4);
const carrier = new Ship("4", "carrier", 5);
const ships = [submarine, destroyer, cruiser, battleship, carrier];

// vars
let draggedShip;
let angle = 0;
let notDropped;
let gameStats = {
    round: 0,
    gameOver: false,
    playerTurn: undefined,
    difficulty: DEFAULT_DIFFICULTY,
    player: {
        hits: [],
        shipsSunk: [],
        hitPercentage: 0
    },
    computer: {
        hits: [],
        shipsSunk: [],
        hitPercentage: 0
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

/* ADD EVENT LISTENERS */
flipButton.addEventListener("click", flip);
startButton.addEventListener("click", startGame);

allPlayerBlocks.forEach((playerBlock) => { 
    playerBlock.addEventListener("dragover", dragOver)
    playerBlock.addEventListener("drop", dropShip)
});
playerBoard.addEventListener('dragleave', dragLeave);
document.addEventListener('dragstart', dragStart);

infoDisplay.textContent = "Plaats je schepen door ze naar het bord te slepen.";

/* FUNCTIONS */
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
        let endRow = Math.floor( ( (startIndex+ship.length) / width) )
        if ( startRow != endRow ) {
            // This means we are out-of-bounds (ship crosses into new row). Adjust startIndex.
            let adjusting = (((startIndex+ship.length)%10))
            validStart = startIndex - adjusting
        }
    } else {
        let startRow = Math.floor(startIndex / width)
        let endRow = startRow+ship.length
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
        (shipBlock) => !shipBlock.classList.contains("taken")
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
    const { shipBlocks, valid, notTaken } = checkPlacement(allBoardBlocks, isHorizontal, startIndex, ship );
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
    draggedShip = ""
    console.log(e);
    if (!e.srcElement.classList.contains('draggable')){
        e.preventDefault();
        return
    } 
    //Are we repositioning a ship?
    allPlayerBlocks.forEach((shipBlock) => {
        if (shipBlock == e.srcElement) {
            notDropped = false;
            draggedShip = ""
            e.target.classList.forEach((classItem) =>  {
                _oTheShip = ships.find(ship => ship.name == classItem)
                
                if (_oTheShip) {
                    draggedShip = _oTheShip //this now functions like the option container div :)
                } 
            })
        }
    });
    notDropped = false;
    if (!draggedShip) {
        draggedShip = ships.filter(obj => {return obj.id === e.target.id})[0];
    }
}

function dragOver(e) {
    e.preventDefault();
    highlightArea(e.target.id, draggedShip);
}

function dropShip(e) {
    const targetError = document.querySelectorAll('#player .error');
    if (targetError.length > 0){
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

