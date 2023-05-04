const gamesBoardContainer = document.querySelector("#gamesBoardContainer");
const optionContainer = document.querySelector(".optionContainer");
const flipButton = document.querySelector("#flipButton");
const startButton = document.querySelector("#startButton");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turnDisplay");
const width = 10;



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



//Event listeners
// startButton.addEventListener("click", startGame);
flipButton.addEventListener("click", flip);



//Flip the preview of ships
function flip() {
    const optionShips = Array.from(optionContainer.children);
    angle = angle === 0 ? 90 : 0;
    optionShips.forEach(
        (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
    );
}



//Create a 10 * 10 gameboard
function createBoard(color, user) {
    sessionStorage.removeItem('droppedShips');
    const gameBoardContainer = document.createElement("div");
    gameBoardContainer.classList.add("gameBoard");
    gameBoardContainer.style.backgroundColor = color;
    gameBoardContainer.id = user;
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement("div");
        block.classList.add("block");
        block.id = i;
        gameBoardContainer.append(block);
    }
    gamesBoardContainer.append(gameBoardContainer);
}
createBoard("lightblue", "player");
createBoard("lightblue", "computer");





// Creating Ships
class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }
}
const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const carrier = new Ship("carrier", 5);
const ships = [destroyer, submarine, cruiser, battleship, carrier];
const optionShips = Array.from(optionContainer.children);
optionShips.forEach((optionShip) => {optionShip.addEventListener("dragstart", dragStart)});




//Check if a ship has a correct spot
function getValibility(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex  : width * width - ship.length  : startIndex <= width * width - width * ship.length ? startIndex  : startIndex - ship.length * width + width;
    let shipBlocks = [];
    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width]);
        }
    }
    let valid;
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
    let startIndex = startId ? startId : randomStartIndex;
    const { shipBlocks, valid, notTaken } = getValibility(allBoardBlocks, isHorizontal, startIndex, ship );
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
ships.forEach((ship) => addShipPiece("computer", ship));




// Drag player ships
const allPlayerBlocks = document.querySelectorAll("#player div");
allPlayerBlocks.forEach((playerBlock) => { 
    playerBlock.addEventListener("dragover", dragOver)
    playerBlock.addEventListener("drop", dropShip)
});
const playerBoard = document.querySelector('#player');
playerBoard.addEventListener('dragleave', dragLeave);

function dragLeave(e) {
    removeHighlightArea();
}


function dragStart(e) {
    notDropped = false;
    draggedShip = e.target;
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
    if (!droppedShips.includes(draggedShip.id)) {
        const startId = e.target.id;
        const ship = ships[draggedShip.id];
        addShipPiece("player", ship, startId);
        if (!notDropped) {
            droppedShips.push(draggedShip.id);
            sessionStorage.setItem('droppedShips', JSON.stringify(droppedShips));
            draggedShip.remove();
        }
    }
    removeHighlightArea();
}

//Load all other scripts


