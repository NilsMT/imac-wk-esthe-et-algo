let width = 640;
let height = 400;

function canvasResize(w, h) {
    width = w;
    height = h;
    resizeCanvas(width, height);
}

function setup() {
    createCanvas(width, height);
}

function draw() {
    canvasResize(640, 400);
    colorMode(HSB, 360, 100, 100);
    stroke(0);

    let n = 0;
    let x = width;
    let y = height;
    let d = 0;

    do {
        d++;
        strokeWeight(d);
        n += d + 1;
        x -= d + 10;
        y -= d + 10;

        let hueValue = map(n, 0, height, 0, 360);
        stroke(hueValue, 100, 100);

        line(n, n, n, y);
        line(n, y, x, y);
        line(x, y, x, n);
        line(x, n, n, n);
    } while (n < y);
}
