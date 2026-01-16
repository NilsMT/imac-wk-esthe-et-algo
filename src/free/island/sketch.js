//config
config = {
    CELL_SIZE: 5,
    ROW: 250,
    COLUMN: 250,
    KEY_COOLDOWN: 250,
    FRAMERATE: 15,
    NOISE_FREQUENCY: 5, //rise for more land and less water
    CELL_TYPE: [
        {
            name: "deep_water",
            color: [26, 95, 205],
        },
        {
            name: "medium_water",
            color: [46, 115, 225],
        },
        {
            name: "shallow_water",
            color: [66, 135, 245],
        },
        {
            name: "sand",
            color: [214, 211, 124],
        },
        {
            name: "grass",
            color: [60, 176, 68],
        },
        {
            name: "high_grass",
            color: [20, 136, 28],
        },
        {
            name: "hill",
            color: [71, 71, 71],
        },
        {
            name: "moutain",
            color: [54, 54, 54],
        },
        {
            name: "snow",
            color: [173, 173, 173],
        },
    ],
};

//autogenerate CELL_ID_BY_NAME
let cellid = {};

config.CELL_TYPE.map((cell, i) => {
    cellid[i] = cell.name;
});

console.log(cellid);
//

let board = [];
let row = config.ROW;
let col = config.COLUMN;

// Buttons
let pauseBtn;
let lastETime = 0;

let resetBtn;
let lastRTime = 0;

let selectPaintBtn;
let lastATime = 0;

// Camera/zoom/drag variables
let camera = {
    x: 0,
    y: 0,
    zoom: 1,
};

let dragStart = { x: 0, y: 0 };

//map status
let isPaused = true;
let isEdited = false;
let isDragging = false;
let isZoomed = false;
let selectedPaint = 0;

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
function cellRules(snapshot, i, j) {
    return snapshot[i][j];
}

/////////////////////////////
//        BOARD MANAGEMENT
/////////////////////////////

function updateBoard() {
    if (isPaused) return;

    if (isEdited) {
        isEdited = false; //TODO: determine how much iteration I need

        const snapshot = board.map((r) => [...r]);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                board[i][j] = cellRules(snapshot, i, j);
            }
        }
    }
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
            const color = [base[0] * shade, base[1] * shade, base[2] * shade];

            fill(color);

            strokeWeight(1);
            stroke(color);
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
function fillBoard(frequency = 3) {
    board = [];

    // get ordered CELL_TYPE indices (0,1,2,...)
    const cellKeys = Object.keys(config.CELL_TYPE)
        .map(Number)
        .sort((a, b) => a - b);

    const levels = cellKeys.length;

    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            const nx = i / row;
            const ny = j / col;

            const n = noise(nx * frequency, ny * frequency); // 0..1

            // map noise → index range
            const idx = Math.min(levels - 1, Math.floor(n * levels));

            board[i][j] = cellKeys[idx];
        }
    }
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

function handlePause() {
    if (!isPaused) {
        isPaused = true;
        pauseBtn.html("paused");
    } else {
        isPaused = false;
        pauseBtn.html("running");
    }
}

function handleReset() {
    fillBoard(config.NOISE_FREQUENCY);
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
    createCanvas(windowHeight * 0.9, windowHeight * 0.9);

    const container = createDiv();
    container.id("container");

    pauseBtn = createButton("paused");
    pauseBtn.mousePressed(handlePause);
    pauseBtn.parent(container);

    let resetBtn = createButton("reset board");
    resetBtn.mousePressed(handleReset);
    resetBtn.parent(container);

    selectPaintBtn = createButton("Paint: " + config.CELL_TYPE[0].name);
    selectPaintBtn.mousePressed(handlePaintCycle);
    selectPaintBtn.parent(container);

    frameRate(config.FRAMERATE);

    // Prevent context menu on canvas
    document.addEventListener("contextmenu", (event) => {
        if (event.target.tagName === "CANVAS") {
            event.preventDefault();
        }
    });

    //start board
    fillBoard(config.NOISE_FREQUENCY);
    background(0);
    updateBoard();
    renderBoard();
}

//update
function draw() {
    let isMoved = isDragging || isZoomed;

    if (isEdited) {
        updateBoard();
    }

    if (isMoved || isEdited) {
        isZoomed = false;
        background(0);
        renderBoard();
    }

    if (keyIsDown(69) && millis() - lastETime > config.KEY_COOLDOWN) {
        //e
        handlePause();
        lastETime = millis();
    }

    if (keyIsDown(82) && millis() - lastRTime > config.KEY_COOLDOWN) {
        //r
        handleReset();
        lastRTime = millis();
    }

    if (keyIsDown(65) && millis() - lastATime > cooldown) {
        //a
        handlePaint();
        lastATime = millis();
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
    // Left click to paint cells
    let j = floor((mouseX + camera.x) / (config.CELL_SIZE * camera.zoom));
    let i = floor((mouseY + camera.y) / (config.CELL_SIZE * camera.zoom));

    //out of bounds check
    if (i >= 0 && i < row && j >= 0 && j < col) {
        board[i][j] = selectedPaint;
        isEdited = true;
    }
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
    isZoomed = true;
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
