let width = 640;
let height = 400;

let mode = 2;
let btn;

function canvasResize(w, h) {
    width = w;
    height = h;
    resizeCanvas(width, height);

    btn.position(10, height + 10);
}

function setup() {
    createCanvas(width, height);

    btn = createButton("Bouton");

    btn.mousePressed(() => {
        mode = mode == 2 ? 0 : mode + 1;

        strokeWeight(1);
        background(255);
    });
}

function draw() {
    if (mode == 0) {
        canvasResize(640, 400);
        colorMode(HSB, 360, 100, 100); //HSB https://fr.wikipedia.org/wiki/Teinte_Saturation_Valeur
        stroke(0);
        btn.html("Lignes épaisses");

        let n = 0; //N=0
        let x = width; // X=Xrsl%
        let y = height; // Y=Yrsl%
        let d = 0;

        do {
            d += 1; // D=D+1
            strokeWeight(d); // Defline 1,D ? (jsp)
            n += d + 1; // N=N+D+1
            x -= d + 10; // X=X-D-10
            y -= d + 10; // Y=Y-D-10

            //Color
            let hueValue = map(n, 0, height, 0, 360); //map r to hue rotation
            stroke(hueValue, 100, 100); //set color from hue
            //

            line(n, n, n, y); //To N,N To N,Y
            line(n, y, x, y); //To N,Y To X,Y
            line(x, y, x, n); //To X,Y To X,N
            line(x, n, n, n); //To X,N To N,N
        } while (n < y); // Until N>=Y
    } else if (mode == 1) {
        canvasResize(400, 400);
        colorMode(HSB, 360, 100, 100); //HSB https://fr.wikipedia.org/wiki/Teinte_Saturation_Valeur
        btn.html("Figure 5");

        let a = width / 2; //A=Xrsl%/2
        let b = height / 2; //B=Yrsl%/2
        for (let i = 1; i <= 2; i++) {
            //For I=1 To 11
            let r = height * 0.7; //R=Yrsl%*0.7
            let rMax = r;

            for (let w = Math.PI / 4; w <= 3.6; w += 0.05) {
                //For W=Pi/4 To 3.6 Step 0.05

                //Color
                let hueValue = map(r, 0, rMax, 0, 360); //map r to hue rotation
                stroke(hueValue, 100, 100); //set color from hue
                //

                let x = r * Math.cos(w); //X=R*Cos(W)
                let y = r * Math.sin(w); //Y=R*Sin(W)
                line(a + x, b - y, a - y, b - x); //Line A+X,B-Y,A-Y,B-X
                line(a - y, b - x, a - x, b + x); //Line A-Y,B-X,A-X,B+X
                line(a - x, b + y, a + x, b - y); //Line A-X,B+Y,A+X,B-Y
                line(a - x, b + y, a + y, b + x); //Line A-X,B+Y,A+Y,B+X
                line(a + y, b + x, a + x, b - y); //Line A+X,B+X,A+X,B-Y
                r *= 0.94; //R=R*0.94
            }

            r /= 0.94; //R=R/0.94

            for (let w = 3.6; w >= Math.PI / 4; w -= 0.05) {
                console.warn("a");

                //Color
                let hueValue = map(r, 0, rMax, 0, 360); //map r to hue rotation
                stroke(hueValue, 100, 100); //set color from hue
                //

                let x = r * Math.cos(w);
                let y = r * Math.sin(w);
                line(a + x, b - y, a - y, b - x);
                line(a - y, b - x, a - x, b + x);
                line(a - x, b + y, a + x, b - y);
                line(a - x, b + y, a + y, b + x);
                line(a + y, b + x, a + x, b - y);
                r /= 0.94;
            }
        }
    } else if (mode == 2) {
        canvasResize(600, 600);
        background(0);
        colorMode(RGB);
        btn.html("Trou noir");
        strokeWeight(1);

        drawBlackhole();
    }
}

/////////////
/////////////
/////////////
/////////////
/////////////

function drawBlackhole() {
    console.warn("a");

    let x = width;
    let y = height;

    let midX = x / 2;
    let midY = y / 2;

    let precision = 3000; //more = better precision
    let radius = min(width, height) * 0.2;
    let length = 100;

    //blackhole outer layers
    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / precision) {
        let endX = midX + Math.cos(angle) * radius;
        let endY = midY + Math.sin(angle) * radius;

        stroke(255, 215, 0);
        line(midX, midY, endX, endY); //circle
        line(
            endX,
            endY,
            endX + Math.cos(angle) * length, //100 for length, trace a line from outer circle based on angle (-1 to 1)
            endY - Math.sin(angle) * length //100 for length, trace a line from outer circle based on angle (-1 to 1)
        );
    }

    //blackhole center layers
    stroke(0);
    ellipse(midX, midY, radius * 1.5, radius * 1.5);
    fill(0);

    //blackhole horizontal lines (curved)
    //help of chatGPT to make the next part (figuring out the offset based on angle distance)
    const range = Math.PI / 8;
    const maxOff = length;

    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / precision) {
        let isNearZ = angle < range || angle > TWO_PI - range;
        let isNearPi = Math.abs(angle - Math.PI) < range;

        if (!isNearZ && !isNearPi) continue;

        //pick center angle
        let centerAngle = isNearPi ? Math.PI : 0;

        //calculate distance from center angle
        //closer from hitting the edge = more offset
        //offset is based on distance
        let diff = Math.atan2(
            Math.sin(angle - centerAngle),
            Math.cos(angle - centerAngle)
        ); //shortest angle difference
        let dist = Math.abs(diff);

        let t = dist / range;
        t = Math.min(t, 1);

        let off = t * maxOff;
        /////

        let ox = Math.cos(angle) * off;
        let oy = Math.sin(angle) * off;

        let startX = midX + ox;
        let startY = midY + oy;

        let endX = midX + Math.cos(angle) * radius;
        let endY = midY + Math.sin(angle) * radius;

        stroke(255, 215, 0);
        line(startX, startY, endX, endY);
        line(
            endX,
            endY,
            endX + Math.cos(angle) * length,
            endY - Math.sin(angle) * length
        );
    }

    //previous line I made, so horizontal line is 2/PI to -2/PI
    /*
    strokeWeight(10);
    stroke(255, 255, 0);
    line(
        midX - Math.sin(Math.PI / 2) * length,
        midY - Math.cos(Math.PI / 2) * length,
        midX + Math.sin(Math.PI / 2) * length,
        midY + Math.cos(Math.PI / 2) * length
    );
    */
}
