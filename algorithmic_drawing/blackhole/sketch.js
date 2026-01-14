let width = 640;
let height = 400;

let precisionSlider;

function canvasResize(w, h) {
    width = w;
    height = h;
    resizeCanvas(width, height);
    precisionSlider.position(120, height + 10);
}

function setup() {
    createCanvas(width, height);

    precisionSlider = createSlider(0, 1500, 1500, 5);
    precisionSlider.position(120, height + 10);
}

function draw() {
    canvasResize(600, 600);
    background(0);
    colorMode(RGB);
    strokeWeight(1);

    drawBlackhole();

    fill(255);
    noStroke();
    textSize(12);
    text("Precision: " + precisionSlider.value(), 10, height - 10);
}

function drawBlackhole() {
    let midX = width / 2;
    let midY = height / 2;

    let precision = precisionSlider.value();
    let radius = min(width, height) * 0.2;
    let length = 100;

    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / precision) {
        let endX = midX + Math.cos(angle) * radius;
        let endY = midY + Math.sin(angle) * radius;

        stroke(255, 215, 0);
        line(midX, midY, endX, endY);
        line(
            endX,
            endY,
            endX + Math.cos(angle) * length,
            endY - Math.sin(angle) * length
        );
    }

    fill(0);
    noStroke();
    ellipse(midX, midY, radius * 1.5);

    const range = Math.PI / 8;
    const maxOff = length;

    stroke(255, 215, 0);

    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / precision) {
        let isNear0 = angle < range || angle > TWO_PI - range;
        let isNearPi = Math.abs(angle - Math.PI) < range;

        if (!isNear0 && !isNearPi) continue;

        let centerAngle = isNearPi ? Math.PI : 0;

        let diff = Math.atan2(
            Math.sin(angle - centerAngle),
            Math.cos(angle - centerAngle)
        );

        let t = min(abs(diff) / range, 1);
        let off = t * maxOff;

        let ox = Math.cos(angle) * off;
        let oy = Math.sin(angle) * off;

        let startX = midX + ox;
        let startY = midY + oy;

        let endX = midX + Math.cos(angle) * radius;
        let endY = midY + Math.sin(angle) * radius;

        line(startX, startY, endX, endY);
        line(
            endX,
            endY,
            endX + Math.cos(angle) * length,
            endY - Math.sin(angle) * length
        );
    }
}
