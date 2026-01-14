let cellSize = 10;
let row = 0;
let col = 0;
let board = [];

let pauseBtn;
let paused = true;

let ruleset = {
    survive: (n) => n === 2 || n === 3,
    birth: (n) => n === 3,
    die: (n) => n < 2 || n > 3,
};

//setup
function setup() {
    frameRate(10);

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

    row = windowHeight / cellSize - 5;
    col = windowWidth / cellSize - 5;
    createCanvas(cellSize * col + 5, cellSize * row + 5);

    fillBoard();
}

//update
function draw() {
    renderBoard();
    updateBoard();

    if (keyIsDown(13)) {
        //space to pause
        handlePause();
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

//handle mouse press on cell
function mousePressed() {
    let j = floor(mouseX / cellSize);
    let i = floor(mouseY / cellSize);

    //out of bound check
    if (i >= 0 && i < row && j >= 0 && j < col) {
        board[i][j] == 1 ? (board[i][j] = 0) : (board[i][j] = 1);
    }
}

//function that init the matrix with 0
function fillBoard() {
    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            board[i][j] = 0;
        }
    }
}
