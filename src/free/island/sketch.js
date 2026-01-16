//config
config = {
    CELL_SIZE: 5,
    phases: [5, 1, 1],
    ROW: 250,
    COLUMN: 250,
    KEY_COOLDOWN: 250,
    FRAMERATE: 60,
    CELL_TYPE: {
        0: {
            name: "deep_water",
            color: [26, 95, 205],
        },
        1: {
            name: "medium_water",
            color: [46, 115, 225],
        },
        2: {
            name: "shallow_water",
            color: [66, 135, 245],
        },
        3: {
            name: "grass",
            color: [60, 176, 68],
        },
        4: {
            name: "sand",
            color: [214, 211, 124],
        },
        5: {
            name: "hill",
            color: [54, 54, 54],
        },
    },
};

//autogenerate CELL_ID_BY_NAME
let cellid = {};
Object.keys(config.CELL_TYPE).map((k) => {
    cellid[config.CELL_TYPE[k].name] = k;
});

console.log(cellid);
//

let board = [];
let row = config.ROW;
let col = config.COLUMN;
let phase;

let pauseBtn;
let paused = true;

let selectPaintBtn;
let selectedPaint = 0;

let frame = 0;
let lastETime = 0;
let lastRTime = 0;

// Camera/zoom/drag variables
let camera = {
    x: 0,
    y: 0,
    zoom: 1,
};

let isDragging = false;
let dragStart = { x: 0, y: 0 };

/////////////////////////////
//        CELLS
/////////////////////////////

//count neighbors of a cell
function countAround(snapshot, i, j, criteria, range = 1) {
    let cnt = 0;

    for (let x = -range; x <= range; x++) {
        for (let y = -range; y <= range; y++) {
            if (x === 0 && y === 0) continue; // skip the cell itself

            const ni = i + x;
            const nj = j + y;

            // check bounds
            if (
                ni >= 0 &&
                ni < snapshot.length &&
                nj >= 0 &&
                nj < snapshot[0].length
            ) {
                if (criteria(snapshot[ni][nj])) {
                    cnt++;
                }
            }
        }
    }

    return cnt;
}

//smoothen out the island shapes
function islandSmoothingRule(snapshot, i, j) {
    const n = countAround(snapshot, i, j, (t) => t > cellid.shallow_water);

    if (snapshot[i][j] > cellid.shallow_water) {
        console.warn();
        //wall survives if 4+ neighbors are walls
        return n >= 4 ? cellid.grass : cellid.shallow_water;
    } else {
        //empty becomes wall if 5+ neighbors are walls
        return n >= 5 ? cellid.grass : cellid.shallow_water;
    }
}

//color cell near water as sand
function islandSandRule(snapshot, i, j) {
    if (snapshot[i][j] > cellid.shallow_water) {
        const n = countAround(snapshot, i, j, (t) => t > cellid.shallow_water);
        return n > 0 ? cellid.sand : snapshot[i][j];
    }
    return snapshot[i][j];
}

//color cell far from water as hill
function islandHillRule(snapshot, i, j) {
    if (snapshot[i][j] > cellid.shallow_water) {
        const n = countAround(
            snapshot,
            i,
            j,
            (t) => t > cellid.shallow_water,
            3
        );
        return n > 0 ? snapshot[i][j] : cellid.hill;
    }
    return snapshot[i][j];
}

/////////////////////////////
//        BOARD MANAGEMENT
/////////////////////////////

function getActivePhase(frame, phases) {
    for (let i = 0; i < phases.length; i++) {
        if (frame < phases[i]) {
            console.warn("this pahse is active: " + i);
            return i; //current phase is active
        }
    }
    return -1; //frame doesnt fit any phase
}

function updateBoard() {
    if (paused) return;

    const snapshot = board.map((r) => [...r]);

    const activePhase = getActivePhase(frame, phase);

    //determine the rule based on phase index
    let rule =
        activePhase === 0
            ? islandSmoothingRule
            : activePhase === 1
            ? islandSandRule
            : activePhase === 2
            ? islandHillRule
            : undefined;

    if (activePhase !== -1 && rule !== undefined) {
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (rule) {
                    board[i][j] = rule(snapshot, i, j);
                }
            }
        }
    }

    frame++; //increment frame AFTER processing
}

//render board
function renderBoard() {
    push();
    translate(-camera.x, -camera.y);
    scale(camera.zoom);

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const cell = board[i][j];
            const base = config.CELL_TYPE[cell].color;

            const r = cellRand(i, j);
            const shade = 0.8 + r * 0.2; // strong & visible

            fill(base[0] * shade, base[1] * shade, base[2] * shade);

            noStroke();
            rect(
                j * config.CELL_SIZE,
                i * config.CELL_SIZE,
                config.CELL_SIZE,
                config.CELL_SIZE
            );
        }
    }
    pop();
}

//function that init the matrix with 0
function fillBoard(scale = 0.15, threshold = 0.5) {
    board = [];

    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            //perlin noise value between 0 and 1
            let n = noise(i * scale, j * scale);
            //threshold determines if cell is grass or water
            board[i][j] = n > threshold ? cellid.grass : cellid.shallow_water;
        }
    }

    frame = 0;
}

/////////////////////////////
//        UTILS
/////////////////////////////

function cellRand(i, j) {
    // deterministic pseudo-random in [0, 1)
    let x = i * 374761393 + j * 668265263;
    x = (x ^ (x >> 13)) * 1274126177;
    return ((x ^ (x >> 16)) >>> 0) / 4294967296;
}

function buildPhases() {
    let t = 0;
    let arr = [];

    for (i = 0; i < config.phases.length; i++) {
        t += config.phases[i];
        arr.push(t);
    }

    return arr;
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

function handleReset() {
    fillBoard();
}

function handlePaintCycle() {
    selectedPaint++;

    let pnt = config.CELL_TYPE[selectedPaint];

    if (!pnt) {
        pnt = config.CELL_TYPE[0];
        selectedPaint = 0;
    }
    selectPaintBtn.html("Paint: " + pnt.name);
}

/////////////////////////////
//        P5 FUNCTIONS
/////////////////////////////

//setup
function setup() {
    phase = buildPhases();

    console.log(phase);

    createCanvas(config.CELL_SIZE * row + 5, config.CELL_SIZE * col + 5);

    const container = createDiv();
    container.id("container");

    pauseBtn = createButton("currently paused");
    pauseBtn.mousePressed(handlePause);
    pauseBtn.parent(container);

    let resetBtn = createButton("reset board");
    resetBtn.mousePressed(handleReset);
    resetBtn.parent(container);

    selectPaintBtn = createButton("Paint: " + config.CELL_TYPE[0].name);
    selectPaintBtn.mousePressed(handlePaintCycle);
    selectPaintBtn.parent(container);

    fillBoard();
    frameRate(config.FRAMERATE);

    // Prevent context menu on canvas
    document.addEventListener("contextmenu", (event) => {
        if (event.target.tagName === "CANVAS") {
            event.preventDefault();
        }
    });
}

//update
function draw() {
    background(255);
    renderBoard();
    updateBoard();

    if (keyIsDown(69) && millis() - lastETime > config.KEY_COOLDOWN) {
        //e
        handlePause();
        lastETime = millis();
    }

    if (keyIsDown(82) && millis() - lastRTime > config.KEY_COOLDOWN) {
        //r
        fillBoard();
        lastRTime = millis();
    }

    if (mouseIsPressed) {
        // Check if right mouse button for dragging
        if (mouseButton === RIGHT) {
            handleDrag();
        } else {
            handlePaint();
        }
    }
}

/////////////////////////////
//        CONTROLS (by Copilot)
/////////////////////////////

function handlePaint() {
    handlePause(); //pause when drawing

    // Left click to paint cells
    let j = floor((mouseX + camera.x) / (config.CELL_SIZE * camera.zoom));
    let i = floor((mouseY + camera.y) / (config.CELL_SIZE * camera.zoom));

    //out of bounds check
    if (i >= 0 && i < row && j >= 0 && j < col) {
        board[i][j] = selectedPaint;
    }

    handlePause(); //unpause when drawing
}

function handleDrag() {
    if (!isDragging) {
        isDragging = true;
        dragStart.x = mouseX;
        dragStart.y = mouseY;
    }

    let deltaX = (dragStart.x - mouseX) / camera.zoom;
    let deltaY = (dragStart.y - mouseY) / camera.zoom;

    // Update camera position
    camera.x += deltaX;
    camera.y += deltaY;

    // Constrain camera to board boundaries
    const maxX = max(0, col * config.CELL_SIZE * camera.zoom - width);
    const maxY = max(0, row * config.CELL_SIZE * camera.zoom - height);

    camera.x = constrain(camera.x, 0, maxX);
    camera.y = constrain(camera.y, 0, maxY);

    dragStart.x = mouseX;
    dragStart.y = mouseY;
}

function mouseReleased() {
    isDragging = false;
}

function mouseWheel(event) {
    // Zoom in/out with mouse wheel
    const zoomSpeed = 0.1;
    const oldZoom = camera.zoom;

    // Calculate minimum zoom to show entire board
    const minZoomX = width / (col * config.CELL_SIZE);
    const minZoomY = height / (row * config.CELL_SIZE);
    const minZoom = min(minZoomX, minZoomY);

    // Scroll down = zoom out, scroll up = zoom in
    if (event.delta > 0) {
        camera.zoom = max(minZoom, camera.zoom - zoomSpeed);
    } else {
        camera.zoom = min(4, camera.zoom + zoomSpeed);
    }

    // Adjust camera position to zoom towards mouse
    const mouseWorldX = (mouseX + camera.x) / oldZoom;
    const mouseWorldY = (mouseY + camera.y) / oldZoom;

    camera.x = mouseWorldX * camera.zoom - mouseX;
    camera.y = mouseWorldY * camera.zoom - mouseY;

    // Constrain camera to board boundaries
    const maxX = max(0, col * config.CELL_SIZE * camera.zoom - width);
    const maxY = max(0, row * config.CELL_SIZE * camera.zoom - height);

    camera.x = constrain(camera.x, 0, maxX);
    camera.y = constrain(camera.y, 0, maxY);

    // Prevent default scrolling
    return false;
}
