const gamesBoardContainer = document.querySelector("#gamesBoardContainer");
const optionContainer = document.querySelector(".optionContainer");
const flipButton = document.querySelector("#flipButton");
const startButton = document.querySelector("#startButton");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turnDisplay");

let angle = 0;
function flip() {
    const optionShips = Array.from(optionContainer.children);
    angle = angle === 0 ? 90 : 0;
    optionShips.forEach(
        (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
    );
}

flipButton.addEventListener("click", flip);

const width = 10;

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
let notDropped;

function getValibility(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal
        ? startIndex <= width * width - ship.length
            ? startIndex
            : width * width - ship.length
        : startIndex <= width * width - width * ship.length
            ? startIndex
            : startIndex - ship.length * width + width;

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

function addShipPiece(user, ship, startId) {
    
   //if(document.querySelectorAll(`.${ship.name}`).length === 0) {




    const allBoardBlocks = document.querySelectorAll(`#${user} div`);
    let randomBoolean = Math.random() < 0.5;
    //console.log(randomBoolean);
    let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
    let randomStartIndex = Math.floor(Math.random() * width * width);

    let startIndex = startId ? startId : randomStartIndex;

    const { shipBlocks, valid, notTaken } = getValibility(
        allBoardBlocks,
        isHorizontal,
        startIndex,
        ship
    );

    if (valid && notTaken) {
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add("taken");
        });
    } else {
        if (user === "computer") addShipPiece("computer", ship, startId);
        if (user === "player") notDropped = true;
    }
//}
}

ships.forEach((ship) => addShipPiece("computer", ship));

// Drag player ships
let draggedShip;
const optionShips = Array.from(optionContainer.children);
optionShips.forEach((optionShip) => {
    optionShip.addEventListener("dragstart", dragStart)
});

const allPlayerBlocks = document.querySelectorAll("#player div");
allPlayerBlocks.forEach((playerBlock) => {
    playerBlock.addEventListener("dragover", dragOver);
    playerBlock.addEventListener("drop", dropShip);
});

const playerBoard = document.querySelector('#player');
playerBoard.addEventListener('dragleave', dragLeave);

function dragLeave(e){
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
    if(xxx !== undefined && xxx !== null) {
        droppedShips = xxx;
    }

    
    if(!droppedShips.includes(draggedShip.id)) {
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

//Add highlight
function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll("#player div");
    const allHoverBlocks = document.querySelectorAll("#player div.hover");
    let isHorizontal = angle === 0;
    let _aHoverBlocks = []

    const { shipBlocks, valid, notTaken } = getValibility(
        allBoardBlocks,
        isHorizontal,
        startIndex,
        ship
    );

    if (valid && notTaken) {
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add("hover");
            _aHoverBlocks.push(shipBlock.id);
        });
    }

    //remove other hover marked blocks
    allHoverBlocks.forEach((_elBlock) => {
        if (_aHoverBlocks) {
            if (!_aHoverBlocks.includes(_elBlock.id)){
                _elBlock.classList.remove("hover"); 
            }
        } else {
            _elBlock.classList.remove("hover"); 
        }
    });
}

function removeHighlightArea() {
    //remove hover class
    const allHoverBlocks = document.querySelectorAll("#player div.hover");
    allHoverBlocks.forEach((_elBlock) => {
            _elBlock.classList.remove("hover");
    });
}
  


let gameOver = false;
let playerTurn;

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
startButton.addEventListener("click", startGame);

var roundCount = 0;
let playerHits = [];
let computerHits = [];
const playerSunkShips = [];
const computerSunkShips = [];

function handleClick(e) {
    if (!gameOver) {
        roundCount ++;
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
            if (targetBlockId == -1){
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
function engageTarget(blockID){
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
function findObviousTarget(){
    let blockId = -1;
    // here we should do something a little bit more intelligent
    return blockId
}
// generate a random, empty, target
function findRandomTarget(){
    let blockId = Math.floor(Math.random() * width * width);
    if (
        allPlayerBlocks[blockId].classList.contains("empty") ||
        allPlayerBlocks[blockId].classList.contains("boom") 
    ) {
        // if this is not an unknown block, retry until we get one
        blockId = findRandomTarget();  
    }
    return blockId
}

function score() {
    var totaal = roundCount;
    var maxHits = 17;
    var procent = Math.round((maxHits/totaal) * 100);
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
            var winscore = score();
            window.open("../pages/win.html?win-score=" + winscore,"_self")
        }
        if (computerSunkShips.length === 5) {
            infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
            gameOver = true;
            window.open("../pages/gameover.html","_self")
        }
    }

    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)
}

function win() {
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    gameOver = true;
    // if (score => 80) {
    //     location.replace("../pages/winrubberduck.html?win-score=" + winscore,"_self");
    // } else { 
    //     window.open("../pages/win.html?win-score=" + winscore,"_self");
    // }
    infoDisplay.textContent = 'You sunk all the computers ships. YOU WON!';
    window.open("../pages/win.html?win-score=" + winscore,"_self");
}
function lose() {
    infoDisplay.textContent = 'The computer has sunk all your ships. YOU LOST!';
    gameOver = true;
    window.open("../pages/gameover.html","_self");
}
