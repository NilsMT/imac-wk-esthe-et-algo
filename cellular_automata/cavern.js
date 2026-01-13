let cellSize = 10;
let row = 0;
let col = 0;
let board = [];

let pauseBtn;
let paused = true;
let lastSpaceTime = 0;
let lastRTime = 0;
const cooldown = 250; //ms

let ruleset = {
    survive: (n) => n >= 4, //stay as a wall
    birth: (n) => n >= 5, //become a wall
    die: (n) => n < 4, //die

    /*
    from https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels

    a tile becomes a wall if it was a wall and 4 or more of its eight neighbors were walls, 
    or if it was not a wall and 5 or more neighbors were. 

    Put more succinctly, a tile is a wall if the 3x3 region centered on it contained at least 5 walls. 
    Each iteration makes each tile more like its neighbors, and the amount of overall "noise" is gradually reduced:
    */
};

//setup
function setup() {
    row = windowHeight / cellSize - 5;
    col = windowWidth / cellSize - 5;

    createCanvas(cellSize * col + 5, cellSize * row + 5);

    const container = createDiv();
    container.id("container");

    pauseBtn = createButton("currently paused");
    pauseBtn.mousePressed(handlePause);
    pauseBtn.parent(container);

    let resetBtn = createButton("reset board");
    resetBtn.mousePressed(function () {
        fillBoard();
    });
    resetBtn.parent(container);

    fillBoard();
    frameRate(15);
}

//update
function draw() {
    renderBoard();
    updateBoard();

    if (keyIsDown(32) && millis() - lastSpaceTime > cooldown) {
        //space
        handlePause();
        lastSpaceTime = millis();
    }

    if (keyIsDown(82) && millis() - lastRTime > cooldown) {
        //r
        fillBoard();
        lastRTime = millis();
    }

    if (mouseIsPressed) {
        let j = floor(mouseX / cellSize);
        let i = floor(mouseY / cellSize);

        // out of bounds check
        if (i >= 0 && i < row && j >= 0 && j < col) {
            board[i][j] = 1; // or 0 depending on what you want
        }
    }
}

function handlePause() {
    if (!paused) {
        paused = true;
        pauseBtn.html("currently paused");
    } else {
        paused = false;
        pauseBtn.html("currently looping");
    }
}

/////////////////////////////////////////////////////////////////////////////////

//count neighbors of a cell
function countNeighbors(i, j) {
    let count = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue; // skip the cell itself
            let ni = i + x;
            let nj = j + y;
            // check boundaries
            if (ni >= 0 && ni < row && nj >= 0 && nj < col) {
                count += board[ni][nj];
            }
        }
    }
    return count;
}

//update matrix based on ruleset
function updateBoard() {
    if (paused) return;

    let newBoard = [];
    for (let i = 0; i < row; i++) {
        newBoard[i] = [];
        for (let j = 0; j < col; j++) {
            let neighbors = countNeighbors(i, j);
            if (board[i][j] === 1) {
                newBoard[i][j] = ruleset.survive(neighbors) ? 1 : 0;
            } else {
                newBoard[i][j] = ruleset.birth(neighbors) ? 1 : 0;
            }
        }
    }
    board = newBoard;
}

//render board
function renderBoard() {
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            if (board[i][j] === 1) {
                fill(0);
            } else {
                fill(255);
            }
            rect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}

//function that init the matrix with 0
function fillBoard() {
    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            board[i][j] = Math.round(random(1));
        }
    }
}
