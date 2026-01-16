const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

let precisionSlider;

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    precisionSlider = createSlider(0, 1500, 1500, 5);
    precisionSlider.position(30, 50);
}

function draw() {
    background(0);
    colorMode(RGB);
    strokeWeight(1);

    drawBlackhole();

    fill(255);
    noStroke();
    textSize(12);
    text("Nombres de lignes: " + precisionSlider.value(), 10, 20);
}

function drawBlackhole() {
    let midX = width / 2;
    let midY = height / 2;

    let precision = precisionSlider.value();
    let radius = min(width, height) * 0.2;
    let length = 100;

    //outer halo
    stroke(255, 215, 0);

    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / precision) {
        let endX = midX + Math.cos(angle) * radius;
        let endY = midY + Math.sin(angle) * radius;

        line(midX, midY, endX, endY);
        line(
            endX,
            endY,
            endX + Math.cos(angle) * length,
            endY - Math.sin(angle) * length
        );
    }

    //center black hole
    fill(0);
    noStroke();
    ellipse(midX, midY, radius * 1.5);

    //horizontal lines
    const range = Math.PI / 8;
    const maxOff = length;

    stroke(255, 215, 0);

    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / precision) {
        let isNear0 = angle < range || angle > TWO_PI - range;
        let isNearPi = Math.abs(angle - Math.PI) < range;

        //select only around pI
        if (!isNear0 && !isNearPi) continue;

        //calculate difference from the center the closer to the edge of the range
        let centerAngle = isNearPi ? Math.PI : 0;

        let diff = Math.atan2(
            Math.sin(angle - centerAngle),
            Math.cos(angle - centerAngle)
        );

        let t = min(abs(diff) / range, 1);
        let off = t * maxOff;

        let ox = Math.cos(angle) * off;
        let oy = Math.sin(angle) * off;
        //

        //offset that difference
        let startX = midX + ox;
        let startY = midY + oy;
        //

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
