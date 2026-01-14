let cellSize = 10;
let row = 0;
let col = 0;
let board = [];

let pauseBtn;
let paused = true;

let isRuleB = false;

let frameCount = 0;
let lastSpaceTime = 0;
let lastRTime = 0;
const cooldown = 250; //ms

function caveRule(snapshot, i, j, n) {
    if (snapshot[i][j] !== 0) {
        // wall survives if 4+ neighbors are walls
        return n >= 3 ? 1 : 0;
    } else {
        // empty becomes wall if 5+ neighbors are walls
        return n >= 5 ? 1 : 0;
    }
}

function hollowRule(snapshot, i, j, n) {
    if (snapshot[i][j] === 1) {
        // wall survives if 7- neighbors are walls
        return n >= 7 ? 0 : 1;
    } else if (isRuleB) {
        // wall survives if 7- neighbors are walls
        return n >= 6 ? 1 : 0;
    }
}

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

    let ruleBtn = createButton("Règle A");
    ruleBtn.mousePressed(function () {
        isRuleB = !isRuleB;
        ruleBtn.html(isRuleB ? "Règle B" : "Règle A");
    });
    ruleBtn.parent(container);

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

    frameCount++;

    const snapshot = board.map((r) => [...r]);

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            let n = countNeighbors(i, j);

            if (frameCount > 5) {
                board[i][j] = hollowRule(snapshot, i, j, n);
            } else {
                board[i][j] = caveRule(snapshot, i, j, n);
            }
        }
    }
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

    frameCount = 0;
}
