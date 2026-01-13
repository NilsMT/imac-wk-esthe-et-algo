//configurable
let config = {
    cellSize: 10,
    filled: false,
    caveGenerationDuration: 30,
    oreDiffusionDuration: 3,
    cellState: {
        0: {
            name: "EMPTY",
            color: [255, 255, 255],
        },
        0.5: {
            name: "GRASS",
            color: [21, 194, 50],
        },
        1: {
            name: "DIRT",
            color: [119, 69, 19],
        },
        2: {
            name: "STONE",
            color: [112, 128, 144],
        },
        3: {
            name: "COAL",
            color: [54, 69, 79],
        },
        4: {
            name: "IRON",
            color: [219, 190, 147],
        },
        5: {
            name: "COPPER",
            color: [204, 101, 33],
        },
        6: {
            name: "GOLD",
            color: [235, 182, 9],
        },
        7: {
            name: "LAPIS",
            color: [9, 114, 235],
        },
        8: {
            name: "REDSTONE",
            color: [224, 9, 9],
        },
        9: {
            name: "EMERALD",
            color: [9, 224, 59],
        },
        10: {
            name: "DIAMOND",
            color: [9, 224, 224],
        },
    },
};
//

let row = 0;
let col = 0;
let board = [];

let pauseBtn;
let paused = true;
let lastSpaceTime = 0;
let lastRTime = 0;
const cooldown = 250; //ms

let frame = 0;
let phase = {
    caveGeneration: config.caveGenerationDuration,
    oreGeneration: config.caveGenerationDuration + 1, //1 frame
    oreDiffusion: config.caveGenerationDuration + config.oreDiffusionDuration,
    grassDiffusion: config.caveGenerationDuration + 4, //1 frame
};

//setup
function setup() {
    row = 64;
    col = windowWidth / config.cellSize - 5;

    createCanvas(config.cellSize * col + 5, config.cellSize * row + 5);

    //container + buttons
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
    ///////////////////////

    fillBoard();

    frameRate(15);
}

//update
function draw() {
    //key input
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
    //

    //mouse drawing
    if (mouseIsPressed) {
        let j = floor(mouseX / config.cellSize);
        let i = floor(mouseY / config.cellSize);

        // out of bounds check
        if (i >= 0 && i < row && j >= 0 && j < col) {
            board[i][j] = 1; // or 0 depending on what you want
        }

        frame = 0;
    }
    //

    updateBoard();
    renderBoard();
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

//count neighbors of a cell that match the criteria
function countN(snapshot, i, j, criteria) {
    let cnt = 0;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue; // skip self
            const neighbor = snapshot[i + x]?.[j + y];
            if (neighbor !== undefined && criteria(neighbor)) {
                cnt++;
            }
        }
    }

    return cnt;
}

/*
from https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
*/
function caveRule(snapshot, i, j, n) {
    if (snapshot[i][j] !== 0) {
        // wall survives if 4+ neighbors are walls
        return n >= 4 ? 1 : 0;
    } else {
        // empty becomes wall if 5+ neighbors are walls
        return n >= 5 ? 1 : 0;
    }
}

// update matrix based on rules
function updateBoard() {
    if (paused) return;

    if (frame < phase.grassDiffusion) {
        frame++;

        // snapshot for safe neighbor reads
        const snapshot = board.map((r) => [...r]);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (frame < phase.caveGeneration) {
                    let n = countN(snapshot, i, j, (t) => t !== 0);
                    board[i][j] = caveRule(snapshot, i, j, n);
                } else if (frame < phase.oreGeneration) {
                    // ore generation rules here
                    board[i][j] = oreGeneration(snapshot, i, j);
                } else if (frame < phase.oreDiffusion) {
                    // ore diffusion rules here
                    board[i][j] = oreDiffusion(snapshot, i, j);
                } else if (frame < phase.grassDiffusion) {
                    board[i][j] = grassDiffusion(snapshot, i, j);
                } else {
                    // keep value unchanged
                    board[i][j] = snapshot[i][j];
                }
            }
        }
    }
}

function oreGeneration(snapshot, i, j) {
    return snapshot[i][j];
}

function oreDiffusion(snapshot, i, j) {
    return snapshot[i][j];
}

function grassDiffusion(snapshot, i, j) {
    const top = snapshot[i - 1]?.[j]; //undefined if out of bound

    // special case: first row
    if (i === 0 && snapshot[i][j] === 1) {
        return 0.5;
    } else if (top === 0 && snapshot[i][j] === 1) {
        return 0.5;
    }

    return snapshot[i][j];
}

//////////////////////////////////////

//render board
function renderBoard() {
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            let state = config.cellState[board[i][j]];

            if (board[i][j] === undefined) {
                console.warn(board);
                console.warn(board[i][j]);
                console.warn("i: " + i + "j: " + j);
            }

            fill(state.color);
            rect(
                j * config.cellSize,
                i * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        }
    }
}

//function that init the matrix with 0
function fillBoard() {
    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            board[i][j] = config.filled ? 1 : Math.round(random(1));
        }
    }
}
