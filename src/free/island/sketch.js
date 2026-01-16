/////////////////////////////
//        CONFIG, CONST AND LET
/////////////////////////////

config = {
    CELL_SIZE: 5,
    ROW: 250,
    COLUMN: 250,
    KEY_COOLDOWN: 250,
    FRAMERATE: 60,
    NOISE_FREQUENCY: 15, //rise for more random shape on the island
    CELL_TYPE: [
        {
            name: "deep_water",
            color: [26, 95, 205],
            weight: 1.5,
        },
        {
            name: "medium_water",
            color: [46, 115, 225],
            weight: 1,
        },
        {
            name: "shallow_water",
            color: [66, 135, 245],
            weight: 0.5,
        },
        {
            name: "sand",
            color: [214, 211, 124],
            weight: 0.3,
        },
        {
            name: "grass",
            color: [60, 176, 68],
            weight: 1,
        },
        {
            name: "high_grass",
            color: [20, 136, 28],
            weight: 0.5,
        },
        {
            name: "hill",
            color: [71, 71, 71],
            weight: 0.5,
        },
        {
            name: "moutain",
            color: [54, 54, 54],
            weight: 0.25,
        },
        {
            name: "snow",
            color: [200, 200, 200],
            weight: 0.05,
        },
    ],
};

let cellid = {};
let board = [];
let row = config.ROW;
let col = config.COLUMN;

//BUTTONS
let pauseBtn;
let lastTTime = 0;

let resetBtn;
let lastRTime = 0;

let selectPaintBtn;
let lastATime = 0;
let lastETime = 0;

//MOUSE MOVEMENTS VARIABLES
let camera = {
    x: 0,
    y: 0,
    zoom: 1,
};

let dragStart = { x: 0, y: 0 };

//MAP STATUS
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

//update the board (model)
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

//render board (view)
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

//function that init the matrix with 0, using perlin noise
// and weighted probability, thanks Copilot for that one, I suck at math :(
function fillBoard(frequency = 5) {
    // randomize noise each call
    noiseSeed(Math.floor(Math.random() * 999999));

    board = [];
    const cellKeys = Object.keys(config.CELL_TYPE)
        .map(Number)
        .sort((a, b) => a - b);
    const levels = cellKeys.length;

    //use weights from CELL_TYPE
    const cellWeights = config.CELL_TYPE.map((c) => c.weight);
    const sumWeight = cellWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = cellWeights.map((w) => w / sumWeight);

    //map center for radial falloff
    const centerX = row / 2;
    const centerY = col / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    //hotspots, main island + secondary islands
    const hotspots = [
        { x: row * 0.7, y: col * 0.6, strength: 0.8, radius: row * 0.2 }, //main island
        { x: row * 0.3, y: col * 0.3, strength: 0.5, radius: row * 0.15 }, //small island
        { x: row * 0.5, y: col * 0.5, strength: 0.4, radius: row * 0.12 }, //tiny island
        { x: row * 0.2, y: col * 0.7, strength: 0.3, radius: row * 0.1 }, //secondary island
        //TODO: make it configurable ?
    ];

    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < col; j++) {
            const nx = i / row;
            const ny = j / col;

            //base noise
            let n = noise(nx * frequency, ny * frequency);

            //apply hotspot influence
            let hotspotInfluence = 0;
            for (let h of hotspots) {
                const dx = i - h.x;
                const dy = j - h.y;
                const distH = Math.sqrt(dx * dx + dy * dy);
                if (distH < h.radius) {
                    hotspotInfluence += h.strength * (1 - distH / h.radius);
                }
            }

            //radial decretion (closer to the edge, closer to 0)
            const dxC = i - centerX;
            const dyC = j - centerY;
            const distC = Math.sqrt(dxC * dxC + dyC * dyC);
            const radialFalloff = 1 - Math.pow(distC / maxDist, 2); // quadratic falloff

            //combine noise, falloff, hotspot
            n = n * radialFalloff + hotspotInfluence;
            n = Math.min(1, Math.max(0, n)); // clamp 0..1

            //map n to weighted cell type (Copilot)
            let cumulative = 0;
            let selected = 0;
            for (let k = 0; k < levels; k++) {
                cumulative += normalizedWeights[k];
                if (n <= cumulative) {
                    selected = cellKeys[k];
                    break;
                }
            }

            board[i][j] = selected;
        }
    }
}

/////////////////////////////
//        UTILS
/////////////////////////////

//pseudo-randomization
function cellRand(i, j) {
    // deterministic pseudo-random in [0, 1)
    let x = i * 374761393 + j * 668265263;
    x = (x ^ (x >> 13)) * 1274126177;
    return ((x ^ (x >> 16)) >>> 0) / 4294967296;
}

//when you pause
function handlePause() {
    isPaused = !isPaused;
    updatePauseBtnStyle();
}

//when you reset
function handleReset() {
    fillBoard(config.NOISE_FREQUENCY);
    background(0);
    updateBoard();
    renderBoard();
}

//when you cycle through paint
function handlePaintCycle(isReverse) {
    if (isReverse) {
        selectedPaint =
            (selectedPaint - 1 + config.CELL_TYPE.length) %
            config.CELL_TYPE.length;
    } else {
        selectedPaint = (selectedPaint + 1) % config.CELL_TYPE.length;
    }

    updatePaintBtnStyle();
}

function updatePauseBtnStyle() {
    pauseBtn.html(isPaused ? "⏸ (T)" : "► (T)");
}

function updatePaintBtnStyle() {
    //get color in hex
    let colorArr = config.CELL_TYPE[selectedPaint].color;
    let colorHex = `rgb(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]})`;

    //style html of button to have a colored square with value of cell inside
    selectPaintBtn.html("(A-E)");
    selectPaintBtn.style("background-color", colorHex);
    selectPaintBtn.style("width", "80px");
    selectPaintBtn.style("height", "40px");
    selectPaintBtn.style("border", "2px solid black");
}

/////////////////////////////
//        P5 FUNCTIONS
/////////////////////////////

//setup
function setup() {
    createCanvas(windowHeight * 0.9, windowHeight * 0.9);

    const container = createDiv();
    container.id("container");

    /////////////////

    pauseBtn = createButton("");
    pauseBtn.mousePressed(handlePause);
    pauseBtn.parent(container);
    //update style
    updatePauseBtnStyle();

    /////////////////

    let resetBtn = createButton("Reset board (R)");
    resetBtn.mousePressed(handleReset);
    resetBtn.parent(container);

    /////////////////

    selectPaintBtn = createButton("");
    selectPaintBtn.mousePressed(handlePaintCycle);
    selectPaintBtn.parent(container);
    //update style
    updatePaintBtnStyle();

    /////////////////

    frameRate(config.FRAMERATE);

    //prevent context menu on canvas (right-click menu)
    document.addEventListener("contextmenu", (event) => {
        if (event.target.tagName === "CANVAS") {
            event.preventDefault();
        }
    });

    //autogenerate cell_id
    config.CELL_TYPE.map((cell, i) => {
        cellid[i] = cell.name;
    });

    //init board
    handleReset();
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

    if (keyIsDown(84) && millis() - lastTTime > config.KEY_COOLDOWN) {
        //t
        handlePause();
        lastTTime = millis();
    }

    if (keyIsDown(82) && millis() - lastRTime > config.KEY_COOLDOWN) {
        //r
        handleReset();
        lastRTime = millis();
    }

    if (keyIsDown(65) && millis() - lastATime > config.KEY_COOLDOWN) {
        //a
        handlePaintCycle(true);
        lastATime = millis();
    } else if (keyIsDown(69) && millis() - lastETime > config.KEY_COOLDOWN) {
        //e
        handlePaintCycle(false);
        lastETime = millis();
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
