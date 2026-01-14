let width = 640;
let height = 400;

let slider;
let value = 0;

//setup
function setup() {
    createCanvas(640, 400);
    background(0);

    frameRate(15);

    slider = createSlider(1, 15, 1, 1);
}

//update
function draw() {
    value = slider.value();

    tree(0);
}

function tree(h) {
    //break condition
    if (h > value) return;
}
