//configurable
let config = {
    FILLED: false,
    CAVEGEN_DURATION: 30,
    OREDIFF_DURATION: 3,
    CELL_TYPE: {
        0: {
            name: "EMPTY",
            color: [150, 200, 255],
            minHeight: 0,
            maxHeight: 64,
            spawnPercentage: 1.0,
            diffusionChance: 0,
            diffusionCount: 0,
        },
        0.5: {
            name: "GRASS",
            color: [21, 194, 50],
            minHeight: 0,
            maxHeight: 255,
            spawnPercentage: 0,
            diffusionChance: 0,
            diffusionCount: 0,
        },
        1: {
            name: "DIRT",
            color: [119, 84, 19],
            minHeight: 0,
            maxHeight: 20,
            spawnPercentage: 1.0,
            diffusionChance: 0,
            diffusionCount: 0,
        },
        2: {
            name: "STONE",
            color: [112, 128, 144],
            minHeight: 16,
            maxHeight: 255,
            spawnPercentage: 1.0,
            diffusionChance: 0,
            diffusionCount: 0,
        },
        3: {
            // COAL: most common
            name: "COAL",
            color: [54, 84, 79],
            minHeight: 19,
            maxHeight: 150,
            spawnPercentage: 0.03,
            diffusionChance: 0.5,
            diffusionCount: 6,
        },
        4: {
            // IRON: moderate rarity
            name: "IRON",
            color: [219, 190, 147],
            minHeight: 25,
            maxHeight: 200,
            spawnPercentage: 0.02,
            diffusionChance: 0.35,
            diffusionCount: 5,
        },
        5: {
            // COPPER: similar to iron
            name: "COPPER",
            color: [204, 101, 33],
            minHeight: 40,
            maxHeight: 180,
            spawnPercentage: 0.01,
            diffusionChance: 0.25,
            diffusionCount: 5,
        },
        6: {
            // GOLD: rare
            name: "GOLD",
            color: [235, 182, 9],
            minHeight: 100,
            maxHeight: 255,
            spawnPercentage: 0.01,
            diffusionChance: 0.4, // lower diffusion due to rarity
            diffusionCount: 2,
        },
        7: {
            // LAPIS: rare, deep
            name: "LAPIS",
            color: [9, 114, 235],
            minHeight: 120,
            maxHeight: 255,
            spawnPercentage: 0.005,
            diffusionChance: 0.35,
            diffusionCount: 2,
        },
        8: {
            // REDSTONE: rare
            name: "REDSTONE",
            color: [224, 9, 9],
            minHeight: 150,
            maxHeight: 255,
            spawnPercentage: 0.008,
            diffusionChance: 0.35,
            diffusionCount: 2,
        },
        9: {
            // EMERALD: very rare
            name: "EMERALD",
            color: [9, 224, 59],
            minHeight: 220,
            maxHeight: 255,
            spawnPercentage: 0.01,
            diffusionChance: 0.25, // very low diffusion
            diffusionCount: 1,
        },
        10: {
            // DIAMOND: rare but slightly more than emerald
            name: "DIAMOND",
            color: [9, 224, 224],
            minHeight: 200,
            maxHeight: 255,
            spawnPercentage: 0.005,
            diffusionChance: 0.3,
            diffusionCount: 2,
        },
    },
};
//

let cellSize = 10;
let row = 0;
let col = 0;
let board = [];

let pauseBtn;
let paused = true;
let lastTTime = 0;
let lastRTime = 0;
const cooldown = 250; //ms

let frame = 0;
let phase = {
    caveGeneration: config.CAVEGEN_DURATION,
    oreGeneration: config.CAVEGEN_DURATION + 1, //1 frame
    oreDiffusion: config.CAVEGEN_DURATION + config.OREDIFF_DURATION,
    grassDiffusion: config.CAVEGEN_DURATION + 4, //1 frame
};

function caveRule(i, j, n) {
    let current = board[i][j];
    if (current !== 0) {
        //wall survives if 4+ neighbors are walls
        return n >= 4 ? 1 : 0;
    } else {
        //empty becomes wall if 5+ neighbors are walls
        return n >= 5 ? 1 : 0;
    }
}

/*
from https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
*/

//setup
function setup() {
    row = 255;
    col = windowWidth / cellSize - 5;

    createCanvas(cellSize * col + 5, cellSize * row + 5);

    const container = createDiv();
    container.id("container");

    pauseBtn = createButton("⏸ (T)");
    pauseBtn.mousePressed(handlePause);
    pauseBtn.parent(container);

    let resetBtn = createButton("Reset (R)");
    resetBtn.mousePressed(function () {
        fillBoard();
    });
    resetBtn.parent(container);

    strokeWeight(0);

    fillBoard();
    frameRate(15);
}

//update
function draw() {
    renderBoard();
    updateBoard();

    if (keyIsDown(84) && millis() - lastTTime > cooldown) {
        //e
        handlePause();
        lastTTime = millis();
    }

    if (keyIsDown(82) && millis() - lastRTime > cooldown) {
        //r
        fillBoard();
        lastRTime = millis();
    }

    if (mouseIsPressed) {
        let j = floor(mouseX / cellSize);
        let i = floor(mouseY / cellSize);

        //out of bounds check
        if (i >= 0 && i < row && j >= 0 && j < col) {
            board[i][j] = 1;
        }

        frame = 0;
    }
}

function handlePause() {
    if (!paused) {
        paused = true;
        pauseBtn.html("⏸ (T)");
    } else {
        paused = false;
        pauseBtn.html("► (T)");
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

    frame++;

    if (frame < phase.caveGeneration) {
        //generate cave shape
        let newBoard = [];
        for (let i = 0; i < row; i++) {
            newBoard[i] = [];
            for (let j = 0; j < col; j++) {
                let neighbors = countNeighbors(i, j);
                newBoard[i][j] = caveRule(i, j, neighbors);
            }
        }
        board = newBoard;
    } else if (frame < phase.oreGeneration) {
        //generate cell type
        let newBoard = [];
        for (let i = 0; i < row; i++) {
            newBoard[i] = [];
            for (let j = 0; j < col; j++) {
                newBoard[i][j] = typeDistribution(i, j);
            }
        }
        board = newBoard;
    } else if (frame < phase.oreDiffusion) {
        //diffuse the ore if some are nearby too
        let newBoard = [];
        for (let i = 0; i < row; i++) {
            newBoard[i] = [];
            for (let j = 0; j < col; j++) {
                let cell = board[i][j];

                newBoard[i][j] = cell;

                if (
                    cell > 2 &&
                    phase.oreDiffusion - frame <=
                        config.CELL_TYPE[cell].diffusionCount
                ) {
                    oreDiffusion(i, j, newBoard);
                }
            }
        }
        board = newBoard;
    } else if (frame < phase.grassDiffusion) {
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (i - 1 >= 0) {
                    if (board[i - 1][j] === 0 && board[i][j] === 1) {
                        board[i][j] = 0.5;
                    }
                } else {
                    if (board[i][j] === 1) {
                        board[i][j] = 0.5;
                    }
                }
            }
        }
    }
}

function typeDistribution(i, j) {
    if (board[i][j] === 1) {
        let possibleCells = [];
        for (let key in config.CELL_TYPE) {
            let cell = config.CELL_TYPE[key];
            if (
                cell.spawnPercentage > 0 &&
                i >= cell.minHeight &&
                i <= cell.maxHeight
            ) {
                if (key != 0) {
                    possibleCells.push(key);
                }
            }
        }

        //possibilities retrieved
        if (possibleCells.length === 0) {
            return 1; //default to DIRT if nothing match
        } else {
            //weighted random selection
            let totalWeight = 0;
            for (let key of possibleCells)
                totalWeight += config.CELL_TYPE[key].spawnPercentage;
            let rand = random() * totalWeight;
            for (let key of possibleCells) {
                rand -= config.CELL_TYPE[key].spawnPercentage;
                if (rand <= 0) {
                    return parseInt(key);
                }
            }
        }
    } else {
        return 0; //keep empty
    }
}
function oreDiffusion(i, j, board) {
    const type = board[i][j];

    const cell = config.CELL_TYPE[type];
    const diffusionChance = cell.diffusionChance;
    const diffusionCount = cell.diffusionCount;

    //diffusion chance
    if (random() >= diffusionChance) return; //didn't diffuse this time

    //collect all valid neighbors (STONE cells)
    let neighbors = [];
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue; //skip self
            const ni = i + di;
            const nj = j + dj;

            if (
                ni >= 0 &&
                ni < board.length &&
                nj >= 0 &&
                nj < board[ni].length &&
                board[ni][nj] === 2 //only STONE
            ) {
                neighbors.push([ni, nj]);
            }
        }
    }

    if (neighbors.length === 0) return; //nothing to diffuse into

    //shuffle neighbors to randomize which get converted
    for (let k = neighbors.length - 1; k > 0; k--) {
        const r = Math.floor(random() * (k + 1));
        [neighbors[k], neighbors[r]] = [neighbors[r], neighbors[k]];
    }

    //convert up to diffusionCount neighbors into the ore
    for (let n = 0; n < Math.min(diffusionCount, neighbors.length); n++) {
        const [ni, nj] = neighbors[n];
        board[ni][nj] = type;
    }
}

//////////////////////////////////////

//render board
function renderBoard() {
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            fill(config.CELL_TYPE[board[i][j]].color);
            rect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}

//function that init the matrix with 0
function fillBoard() {
    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            board[i][j] = config.FILLED ? 1 : Math.round(random(1));
        }
    }
}
