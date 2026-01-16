//config
let config = {
    //UI Data
    CANVAS_HEIGHT: 800,
    CANVAS_WIDTH: 800,
    UI: {
        marginX: 20, //left-right margin
        marginY: 40, //top-bottom margin
        rowHeight: 50, //vertical spacing between rows
        colSpacing: 150, //horizontal spacing between sliders
        textHeight: 25,
        textXOffset: 15,
    },

    //change \w slider
    maxBranch: 8,
    maxDepth: 7,
    spawnRate: 50,
    treeOpacity: 0,
    angleSpread: Math.PI / 4,
    branchLength: 100,

    //others
    PARTICLE_SIZE: 2,
    BRANCH_SIZE: 1,
    BRANCH_START_HUE: 240, //blue at start
    BRANCH_END_HUE: 0, //red at end
    PARTICLE_COLOR: [200, 0, 255],
};

//sliders
let numSlider;
let depthSlider;
let spawnRateSlider;
let treeOpacitySlider;
let angleSlider;
let lenSlider;

//data
let treeRoots = [];
let particles = [];

//setup
function setup() {
    createCanvas(config.CANVAS_HEIGHT, config.CANVAS_WIDTH);

    frameRate(60);

    background(0);

    drawSliders();
}

//frame update
function draw() {
    let newMaxBranch = numSlider.value();
    let newMaxDepth = depthSlider.value();
    let newSpawnRate = spawnRateSlider.value();
    let newTreeOpacity = treeOpacitySlider.value();
    let newAngleSpread = angleSlider.value();
    let newBranchLength = lenSlider.value();

    if (
        config.maxBranch !== newMaxBranch ||
        config.maxDepth !== newMaxDepth ||
        config.spawnRate !== newSpawnRate ||
        config.treeOpacity != newTreeOpacity ||
        config.angleSpread != newAngleSpread ||
        config.branchLength != newBranchLength
    ) {
        treeRoots = [];
        particles = [];

        config.maxBranch = newMaxBranch;
        config.maxDepth = newMaxDepth;
        config.spawnRate = newSpawnRate;
        config.treeOpacity = newTreeOpacity;
        config.angleSpread = newAngleSpread;
        config.branchLength = newBranchLength;

        clear();
        background(0);
    }

    background(30, 0);
    translate(width / 2, height / 2);

    drawUI();

    if (treeRoots.length === 0) {
        createTree();
    }

    let toSpawn = config.spawnRate * (deltaTime / 1000);
    for (let i = 0; i < toSpawn; i++) {
        spawnParticle();
    }

    moveParticles();
}

//draw the UI sliders (using a flex-wrap like thing)
function drawSliders() {
    //row 0
    numSlider = createSlider(1, 15, config.maxBranch, 1);
    numSlider.position(config.UI.marginX, config.UI.marginY);

    depthSlider = createSlider(1, 10, config.maxDepth, 1);
    depthSlider.position(
        config.UI.marginX + config.UI.colSpacing,
        config.UI.marginY
    );

    spawnRateSlider = createSlider(0, 250, config.spawnRate, 1);
    spawnRateSlider.position(
        config.UI.marginX + config.UI.colSpacing * 2,
        config.UI.marginY
    );

    //row 1
    treeOpacitySlider = createSlider(0, 100, config.treeOpacity, 1);
    treeOpacitySlider.position(
        config.UI.marginX,
        config.UI.marginY + config.UI.rowHeight
    );

    angleSlider = createSlider(0, PI / 2, config.angleSpread, PI / 512);
    angleSlider.position(
        config.UI.marginX + config.UI.colSpacing,
        config.UI.marginY + config.UI.rowHeight
    );

    lenSlider = createSlider(0, 200, config.branchLength, 1);
    lenSlider.position(
        config.UI.marginX + config.UI.colSpacing * 2,
        config.UI.marginY + config.UI.rowHeight
    );
}

//draw the UI texts (using a flex-wrap like thing)
function drawUI() {
    fill(255);
    noStroke();

    const off = {
        x: width / 2 + config.UI.textXOffset,
        y: height / 2 + config.UI.textHeight,
    };

    //row 0
    text(
        "Branches: " + config.maxBranch,
        config.UI.marginX - off.x,
        config.UI.marginY - off.y
    );
    text(
        "Depth: " + config.maxDepth,
        config.UI.marginX + config.UI.colSpacing - off.x,
        config.UI.marginY - off.y
    );
    text(
        "Particles rate: " + config.spawnRate + "/frame",
        config.UI.marginX + config.UI.colSpacing * 2 - off.x,
        config.UI.marginY - off.y
    );

    //row 1
    text(
        "Branch opacity: " + config.treeOpacity + "%",
        config.UI.marginX - off.x,
        config.UI.marginY + config.UI.rowHeight - off.y
    );
    text(
        "Branch angle: " + round(degrees(config.angleSpread)) + "°",
        config.UI.marginX + config.UI.colSpacing - off.x,
        config.UI.marginY + config.UI.rowHeight - off.y
    );
    text(
        "Zoom: " + config.branchLength + "%",
        config.UI.marginX + config.UI.colSpacing * 2 - off.x,
        config.UI.marginY + config.UI.rowHeight - off.y
    );
}

//create the tree (data + visual)
function createTree() {
    colorMode(HSB, 360, 100, 100);
    for (let i = 0; i < config.maxBranch; i++) {
        let angle = (TWO_PI * i) / config.maxBranch;
        treeRoots.push(
            createBranchTree(createVector(0, 0), config.branchLength, 0, angle)
        );
    }
    colorMode(RGB, 255, 255, 255);
}

//one iteration of the tree
function createBranchTree(pos, len, depth, angle = 0) {
    if (depth > config.maxDepth) return null;

    let dx = len * sin(angle);
    let dy = -len * cos(angle);
    let endPos = p5.Vector.add(pos, createVector(dx, dy));

    let hueValue = map(
        depth,
        0,
        config.maxDepth,
        config.BRANCH_START_HUE,
        config.BRANCH_END_HUE
    );
    stroke(hueValue, 100, 100, config.treeOpacity / 100);

    line(pos.x, pos.y, endPos.x, endPos.y);

    let branch = { pos: pos.copy(), end: endPos.copy(), children: [] };

    if (depth < config.maxDepth) {
        branch.children.push(
            createBranchTree(
                endPos,
                len * 0.7,
                depth + 1,
                angle + config.angleSpread
            )
        );
        branch.children.push(
            createBranchTree(
                endPos,
                len * 0.7,
                depth + 1,
                angle - config.angleSpread
            )
        );
    }

    return branch;
}

//spawn a particle (or not if exceeding the limit)
function spawnParticle() {
    if (treeRoots.length === 0) return;
    particles.push({
        branch: random(treeRoots),
        t: 0,
        speed: random(0.01, 0.03),
    });
}

//move the particles, following a random sub-branch
function moveParticles() {
    stroke(config.PARTICLE_COLOR);
    strokeWeight(config.PARTICLE_SIZE);

    //for each particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        let pos = p5.Vector.lerp(p.branch.pos, p.branch.end, p.t);
        point(pos.x, pos.y);

        p.t += p.speed;

        //take a new target if reached current
        if (p.t >= 1) {
            if (p.branch.children.length > 0) {
                p.branch = random(p.branch.children);
                p.t = 0;
            } else {
                particles.splice(i, 1);
            }
        }
    }

    strokeWeight(config.BRANCH_SIZE);
}
