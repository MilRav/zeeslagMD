export { constants, ships, sounds }

//gameplay
const constants = {
    DEFAULT_DIFFICULTY: 8,
    EASY_DIFFICULTY: 12,
    HARD_DIFFICULTY: 4,
    DIFFICULTY_THRESHOLD: 3,
    DUCKY_THRESHOLD: 40,
    NORMAL_SPEED: () => Math.floor(Math.random() * 3 * 1000) + 1500,
    DEBUG_SPEED: 10,
    AFTER_TURN_TIME: 1000, // defines the time after a turn is complete 
    BOARD_WIDTH: 10
}

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

// sounds
const sounds = {
    hitSound: new Audio('../media/hitsound.mp3'),
    sinkSound: new Audio('../media/watersplash.mp3')
}
