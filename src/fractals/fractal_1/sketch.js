//config
//UI data
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const UI = {
    marginX: 20, //left-right margin
    marginY: 30, //top-bottom margin
    rowHeight: 50, //vertical spacing between rows
    colSpacing: 150, //horizontal spacing between sliders
};

//change \w slider
let maxBranch = 8;
let maxDepth = 7;
let spawnRate = 50;
let fadeTime = 0;
let angleSpread = Math.PI / 4;

//not in slider
let particleSize = 2;
let branchSize = 1;
let baseLength = 100;
const START_HUE = 240; //blue at start
const END_HUE = 0; //red at end

//sliders
let numSlider;
let depthSlider;
let spawnRateSlider;
let fadeSlider;
let angleSlider;

//data
let treeRoots = [];
let particles = [];

//setup
function setup() {
    createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);

    frameRate(30);

    background(0);

    drawSliders();
}

//frame update
function draw() {
    let newMaxBranch = numSlider.value();
    let newMaxDepth = depthSlider.value();
    let newSpawnRate = spawnRateSlider.value();
    let newFadeTime = fadeSlider.value();
    let newAngleSpread = angleSlider.value();

    if (
        maxBranch !== newMaxBranch ||
        maxDepth !== newMaxDepth ||
        spawnRate !== newSpawnRate ||
        fadeTime != newFadeTime ||
        angleSpread != newAngleSpread
    ) {
        treeRoots = [];
        particles = [];

        maxBranch = newMaxBranch;
        maxDepth = newMaxDepth;
        spawnRate = newSpawnRate;
        fadeTime = newFadeTime;
        angleSpread = newAngleSpread;

        clear();
        background(0);
    }

    background(30, fadeTime);
    translate(width / 2, height / 2);

    drawUI();

    if (treeRoots.length === 0) {
        createTree();
    }

    let toSpawn = spawnRate * (deltaTime / 1000);
    for (let i = 0; i < toSpawn; i++) {
        spawnParticle();
    }

    moveParticles();
}

//draw the UI sliders (using a flex-wrap like thing)
function drawSliders() {
    //row 0
    numSlider = createSlider(1, 15, maxBranch, 1);
    numSlider.position(UI.marginX, UI.marginY);

    depthSlider = createSlider(1, 8, maxDepth, 1);
    depthSlider.position(UI.marginX + UI.colSpacing, UI.marginY);

    spawnRateSlider = createSlider(0, 250, spawnRate, 1);
    spawnRateSlider.position(UI.marginX + UI.colSpacing * 2, UI.marginY);

    //row 1
    fadeSlider = createSlider(0, 100, fadeTime, 1);
    fadeSlider.position(UI.marginX, UI.marginY + UI.rowHeight);

    angleSlider = createSlider(0, PI / 2, angleSpread, 0.001);
    angleSlider.position(UI.marginX + UI.colSpacing, UI.marginY + UI.rowHeight);
}

//draw the UI texts (using a flex-wrap like thing)
function drawUI() {
    fill(255);
    noStroke();

    const off = {
        x: width / 2,
        y: height / 2 + 10,
    };

    //row 0
    text("Branches: " + maxBranch, UI.marginX - off.x, UI.marginY - off.y);
    text(
        "Depth: " + maxDepth,
        UI.marginX + UI.colSpacing - off.x,
        UI.marginY - off.y
    );
    text(
        "Particles: " + spawnRate,
        UI.marginX + UI.colSpacing * 2 - off.x,
        UI.marginY - off.y
    );

    //row 1
    text(
        "Fade time: " + fadeTime,
        UI.marginX - off.x,
        UI.marginY + UI.rowHeight - off.y
    );
    text(
        "Branch angle: " + round(degrees(angleSpread)) + "°",
        UI.marginX + UI.colSpacing - off.x,
        UI.marginY + UI.rowHeight - off.y
    );
}

//create the tree (data + visual)
function createTree() {
    colorMode(HSB, 360, 100, 100);
    for (let i = 0; i < maxBranch; i++) {
        let angle = (TWO_PI * i) / maxBranch;
        treeRoots.push(
            createBranchTree(createVector(0, 0), baseLength, 0, angle)
        );
    }
    colorMode(RGB, 255, 255, 255);
}

//one iteration of the tree
function createBranchTree(pos, len, depth, angle = 0) {
    if (depth > maxDepth) return null;

    let dx = len * sin(angle);
    let dy = -len * cos(angle);
    let endPos = p5.Vector.add(pos, createVector(dx, dy));

    let hueValue = map(depth, 0, maxDepth, START_HUE, END_HUE);
    stroke(hueValue, 100, 100);

    line(pos.x, pos.y, endPos.x, endPos.y);

    let branch = { pos: pos.copy(), end: endPos.copy(), children: [] };

    if (depth < maxDepth) {
        branch.children.push(
            createBranchTree(endPos, len * 0.7, depth + 1, angle + angleSpread)
        );
        branch.children.push(
            createBranchTree(endPos, len * 0.7, depth + 1, angle - angleSpread)
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
    stroke(200, 0, 255);
    strokeWeight(particleSize);

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

    strokeWeight(branchSize);
}
