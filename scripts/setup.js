// board
const gamesBoardContainer = document.querySelector("#gamesBoardContainer");
const optionContainer = document.querySelector(".optionContainer");
const flipButton = document.querySelector("#flipButton");
const startButton = document.querySelector("#startButton");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turnDisplay");
const scoreDisplay = document.querySelector("accuracy");
const width = 10;

// ships
class Ship {
    constructor(id, name, length) {
        this.id = id;
        this.name = name;
        this.length = length;
    }
}

const destroyer = new Ship("0", "destroyer", 2);
const submarine = new Ship("1", "submarine", 3);
const cruiser = new Ship("2", "cruiser", 3);
const battleship = new Ship("3", "battleship", 4);
const carrier = new Ship("4", "carrier", 5);
const ships = [destroyer, submarine, cruiser, battleship, carrier];
const optionShips = Array.from(optionContainer.children);

// vars
let draggedShip;
let angle = 0;
let notDropped;
let gameOver = false;
let playerTurn;
let roundCount = 0;
let playerHits = [];
let computerHits = [];
let playerSunkShips = [];
let computerSunkShips = [];

/* SETUP BOARDS */
document.querySelector('#gameContainer').classList.add('setup')

createBoard("player");
createBoard("computer");
const allPlayerBlocks = document.querySelectorAll("#player div");
const playerBoard = document.querySelector('#player');

ships.forEach((ship) => addShipPiece("computer", ship));

/* ADD EVENT LISTENERS */
flipButton.addEventListener("click", flip);
optionShips.forEach((optionShip) => {optionShip.addEventListener("dragstart", dragStartFromShipSelection)});
allPlayerBlocks.forEach((playerBlock) => { 
    playerBlock.addEventListener("dragover", dragOver)
    playerBlock.addEventListener("drop", dropShip)
    playerBlock.addEventListener("dragstart", dragStartFromBoard)
});
playerBoard.addEventListener('dragleave', dragLeave);

/* FUNCTIONS */
//Flip the preview of ships
function flip() {
    const optionShips = Array.from(optionContainer.children);
    angle = angle === 0 ? 90 : 0;
    optionShips.forEach(
        (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
    );
}

//Create a 10 * 10 gameboard
function createBoard(user) {
    sessionStorage.removeItem('droppedShips');
    const gameBoardContainer = document.createElement("div");
    gameBoardContainer.classList.add("gameBoard");
    gameBoardContainer.id = user;
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement("div");
        block.classList.add("block");
        block.id = i;
        gameBoardContainer.append(block);
    }
    gamesBoardContainer.append(gameBoardContainer);
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
    });
}

// Drag and drop functions 
function dragLeave(e) {
    removeHighlightArea();
}

function dragStartFromShipSelection(e) {
    notDropped = false;
    draggedShip = e.target;
}

function dragStartFromBoard(e) {
    notDropped = false;
    draggedShip = ""

    e.target.classList.forEach((classItem) =>  {
        _oTheShip = ships.find(ship => ship.name == classItem)
        if (_oTheShip) {
            draggedShip = _oTheShip //this now functions like the option container div :)
            return
        }
    })
}

function dragOver(e) {
    e.preventDefault();
    const ship = ships[draggedShip.id];
    highlightArea(e.target.id, ship);
}

function dropShip(e) {
    let xxx = JSON.parse(sessionStorage.getItem('droppedShips'));
    let droppedShips = [];
    if (xxx !== undefined && xxx !== null) {
        droppedShips = xxx;
    }
    const ship = ships[draggedShip.id];

    if (droppedShips.includes(draggedShip.id)) {
        removeShipPiece(ship)
    }
    
    const startId = e.target.id;
    
    addShipPiece("player", ship, startId);
    if (!notDropped) {
        droppedShips.push(draggedShip.id);
        sessionStorage.setItem('droppedShips', JSON.stringify(droppedShips));
        if (draggedShip.constructor.name == 'HTMLDivElement') {
            // new from our options container, so remove from it
            draggedShip.remove();
        }
    }     
    removeHighlightArea();
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