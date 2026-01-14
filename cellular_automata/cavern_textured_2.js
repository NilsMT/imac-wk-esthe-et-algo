//configurable
let config = {
    cellSize: 10,
    filled: false,
    caveGenerationDuration: 15,
    oreDiffusionDuration: 3,

    dirtColumnLength: 3,
    additionalDirtColumnLength: 3,

    cellType: [
        { id: 0, name: "EMPTY", color: [150, 200, 255] },
        { id: 1, name: "GRASS", color: [21, 194, 50] },
        { id: 2, name: "DIRT", color: [119, 69, 19] },
        { id: 3, name: "STONE", color: [112, 128, 144], range: { min: 16 } },

        //common ores
        {
            id: 4,
            name: "COAL",
            color: [54, 69, 79],
            range: { min: 16, max: 90 },
            spawnRate: 0.005,
            veinSize: 12,
            expandRate: 0.5,
        },
        {
            id: 5,
            name: "IRON",
            color: [219, 190, 147],
            range: { min: 20, max: 90 },
            spawnRate: 0.004,
            veinSize: 9,
            expandRate: 0.5,
        },
        {
            id: 6,
            name: "COPPER",
            color: [204, 101, 33],
            range: { min: 25, max: 90 },
            spawnRate: 0.002,
            veinSize: 8,
            expandRate: 0.5,
        },

        //uncommon ores
        {
            id: 7,
            name: "GOLD",
            color: [235, 182, 9],
            range: { min: 50, max: 110 },
            spawnRate: 0.005,
            veinSize: 7,
            expandRate: 0.3,
        },
        {
            id: 8,
            name: "LAPIS",
            color: [9, 114, 235],
            range: { min: 50, max: 100 },
            spawnRate: 0.003,
            veinSize: 7,
            expandRate: 0.3,
        },
        {
            id: 9,
            name: "REDSTONE",
            color: [224, 9, 9],
            range: { min: 75, max: 128 },
            spawnRate: 0.003,
            veinSize: 8,
            expandRate: 0.4,
        },

        //rare ores
        {
            id: 10,
            name: "EMERALD",
            color: [9, 224, 59],
            range: { min: 113, max: 128 },
            spawnRate: 0.001,
            veinSize: 6,
            expandRate: 0.5,
        },
        {
            id: 11,
            name: "DIAMOND",
            color: [9, 224, 224],
            range: { min: 100, max: 128 },
            spawnRate: 0.0008,
            veinSize: 4,
            expandRate: 0.75,
        },
    ],

    /*
    COAL: 9472
    IRON: 8960
    COPPER: 8320
    GOLD: 7680
    LAPIS: 5120
    REDSTONE: 6784
    EMERALD: 1920
    DIAMOND: 1920
    */
};

let oreType = config.cellType.filter((ore) => ore.id > 3);
//

let row = 0;
let col = 0;
let board = [];
let stoneTreshhold = [];

let pauseBtn;
let paused = true;
let lastSpaceTime = 0;
let lastRTime = 0;
const cooldown = 250; //ms

let frame = 0;

//phase
function buildPhases() {
    let t = 0;

    return [
        (t += config.caveGenerationDuration), //grass and stone spawn
        (t += 1), //ore spawn
        (t += 10), //ore expansion
        (t += config.oreDiffusionDuration),
    ];
}

let phase = buildPhases();
//

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//setup
function setup() {
    row = 128;
    col = (windowWidth * 2) / config.cellSize - 5;

    createCanvas(config.cellSize * col + 5, config.cellSize * row + 5);

    strokeWeight(0);

    //container + buttons
    const container = createDiv();
    container.id("container");

    pauseBtn = createButton("currently paused");
    pauseBtn.mousePressed(handlePause);
    pauseBtn.parent(container);

    let resetBtn = createButton("reset board");
    resetBtn.mousePressed(function () {
        resetBoard();
    });
    resetBtn.parent(container);
    ///////////////////////

    resetBoard();

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
        resetBoard();
        lastRTime = millis();
    }
    //

    //mouse drawing
    if (mouseIsPressed) {
        let j = floor(mouseX / config.cellSize);
        let i = floor(mouseY / config.cellSize);

        //out of bounds check
        if (i >= 0 && i < row && j >= 0 && j < col) {
            board[i][j] = 1;
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
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function countAbove(snapshot, i, j, range, criteria) {
    let cnt = 0;

    for (let k = 1; k <= range; k++) {
        const v = snapshot[i - k]?.[j];
        if (v === undefined) break;
        if (criteria(v)) cnt++;
        else break; //if criteria fail, stop
    }

    return cnt;
}

//count neighbors of a cell that match the criteria
function countAround(snapshot, i, j, criteria) {
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

//from https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
function caveRule(snapshot, i, j, n) {
    if (snapshot[i][j] !== 0) {
        // wall survives if 4+ neighbors are walls
        return n >= 4 ? 1 : 0;
    } else {
        // empty becomes wall if 5+ neighbors are walls
        return n >= 5 ? 1 : 0;
    }
}

//update matrix based on rules
function updateBoard() {
    if (paused) return;

    if (frame < phase[phase.length - 1]) {
        frame++;

        //snapshot for safe neighbor reads
        const snapshot = board.map((r) => [...r]);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (frame < phase[0]) {
                    let n = countAround(snapshot, i, j, (t) => t !== 0);
                    board[i][j] = caveRule(snapshot, i, j, n) * 2;
                } else if (frame < phase[1]) {
                    board[i][j] = baseDiffusion(snapshot, i, j);
                } else if (frame < phase[2]) {
                    // ore generation rules here
                    board[i][j] = oreGeneration(snapshot, i, j);
                } else if (frame > phase[2] && frame < phase[3]) {
                    // ore diffusion rules here
                    board[i][j] = oreDiffusion(snapshot, i, j);
                } else {
                    // keep value unchanged
                    board[i][j] = snapshot[i][j];
                }
            }
        }
    }
}

//turn dirt to grass and stone
function baseDiffusion(snapshot, i, j) {
    const current = snapshot[i][j];
    const top = snapshot[i - 1]?.[j];
    const threshold = stoneTreshhold[j];

    if (current === 2) {
        if (
            (top === undefined || top === 0) &&
            i < threshold + config.cellType[3].range.min
        ) {
            return 1; // GRASS
        } else {
            const dirtAbove = countAbove(snapshot, i, j, 6, (t) => t === 2);

            if (
                dirtAbove >= threshold ||
                top === 3 ||
                i >= threshold + config.cellType[3].range.min
            ) {
                return 3; // STONE
            }
        }
    }

    return current;
}

//place single ores on board
function oreGeneration(snapshot, i, j) {
    let cell = snapshot[i][j];

    //if cell is stone can be replaced ore
    if (cell === 3) {
        let candidates = oreType.filter(
            (ore) => i >= ore.range.min && i <= ore.range.max
        );

        if (candidates.length == 0) {
            return 3;
        }

        let targetIndex = Math.floor(random(candidates.length));
        let targetOre = candidates[targetIndex];

        //decide wether it shall be the ore or not
        if (random(1) <= targetOre.spawnRate) {
            return targetOre.id;
        }
    }

    return snapshot[i][j]; //default
}

//grow the ore to have kind of veins
function oreDiffusion(snapshot, i, j) {
    let cell = snapshot[i][j];

    // Keep original cell
    snapshot[i][j] = cell;

    // Only diffuse ores
    if (cell > 3) {
        const ore = config.cellType[cell];
        const veinSize = ore.veinSize || 1;
        const expandRate = ore.expandRate || 0.5; // default 50% chance

        // Limit number of expansion attempts by veinSize
        if (phase[3] - frame <= veinSize) {
            // Roll chance to expand
            if (random() <= expandRate) {
                // Pick a random neighbor
                const neighbors = [
                    [i - 1, j],
                    [i + 1, j],
                    [i, j - 1],
                    [i, j + 1],
                ].sort(() => random() - 0.5);

                for (let [ni, nj] of neighbors) {
                    // Only expand into STONE
                    if (snapshot[ni]?.[nj] === 3) {
                        snapshot[ni][nj] = cell; // spread ore
                        break; // only one expansion per call
                    }
                }
            }
        }
    }

    return cell;
}

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//render board
function renderBoard() {
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            fill(config.cellType[board[i][j]].color);
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
function resetBoard() {
    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            board[i][j] = (config.filled ? 1 : Math.round(random(1))) * 2;
        }
    }

    for (let j = 0; j < col; j++) {
        stoneTreshhold.push(
            config.dirtColumnLength +
                Math.floor(random(config.additionalDirtColumnLength))
        );
    }
}
