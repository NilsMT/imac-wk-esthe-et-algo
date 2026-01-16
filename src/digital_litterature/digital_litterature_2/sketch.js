let config = {
    TEXT: "",
    //UI Data
    CELL_SIZE: 10,
    START_ORI: "x",
};

const outputElement = document.getElementById("output");
const inputElement = document.getElementById("input");

////////////////////////////////
//  ADDITIONAL STUFF
////////////////////////////////

//https://github.com/cprosche/mulberry32 deterministic random with seed
function mulberry32(seed) {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

////////////////////////////////
//  JSON Dominos
////////////////////////////////

const DOMINOS = {
    y: {},
    x: {},
};

const SPE_DOMINOS = {
    y: {
        "?-?": "🁢",
    },
    x: {
        "?-?": "🀰",
    },
};

//random at start
let previousDomino = [-1, -1];

//fill the json
function initJson() {
    //add dominoes
    appendCharInRange(0x1f031, 0x1f061, DOMINOS.x); //127025–127073 UNICODE range
    appendCharInRange(0x1f063, 0x1f093, DOMINOS.y); //127075–127123 UNICODE range

    console.log(DOMINOS);
    console.log(SPE_DOMINOS);
}

//return the list of char included in the range
function appendCharInRange(st, nd, json) {
    let sub_index = 0;
    for (let i = st; i <= nd; i++) {
        //UNICODE dominos order goes 0-0, 0-1, ... 6-6
        const row = Math.floor(sub_index / 7);
        const col = sub_index % 7;

        //name objet accordingly "X-Y"
        json[`${row}-${col}`] = String.fromCodePoint(i);
        sub_index++;
    }
}

//turn X-Y into XY
function getDominoValue(k) {
    return Number(k.replace("-", ""));
}

//turn X-Y into [X,Y]
function splitDominoValue(k) {
    return k.split("-").map((m) => Number(m));
}

//val, json is the selected set of dominos
function giveDominos(val, json) {
    let ori = json["0-0"] === DOMINOS["x"]["0-0"] ? "x" : "y";
    let keys = Object.keys(json);
    let result = [];

    //loop until no more to give
    while (val > 0) {
        //stop if previous domino is [0,0]
        if (previousDomino[0] === 0 && previousDomino[1] === 0) {
            break;
        }

        //initialize previousDomino if it's the joker state
        if (previousDomino[0] === -1 && previousDomino[1] === -1) {
            previousDomino = [0, val % 7];
        }

        // select subtraction candidates
        let playableCandidates = keys.filter((k) => {
            let sp = splitDominoValue(k); //[start, end]
            let canBePlayed = sp[0] === previousDomino[1] && k != "0-0"; //must match previous domino's end

            return canBePlayed;
        });
        let candidates = playableCandidates.filter((k) => {
            let nval = getDominoValue(k); //X*10 + Y
            return nval <= val; //can this domino fit numerically?
        });

        if (candidates.length > 0) {
            //choose one of them at random
            let choice = Math.floor(mulberry32(val) * candidates.length);
            let chosenKey = candidates[choice];

            let choseVal = getDominoValue(chosenKey);
            let choseSp = splitDominoValue(chosenKey);

            //add to result
            result.push(json[chosenKey]);
            previousDomino = choseSp;

            //subtract choice, then reiterate
            val -= choseVal;
        } else {
            let choice = Math.floor(
                mulberry32(val) * playableCandidates.length
            );
            let chosenKey = playableCandidates[choice];
            let choseSp = splitDominoValue(chosenKey);

            //add to result
            result.push(json[chosenKey]);
            previousDomino = choseSp;
            break;
        }
    }
    return result;
}

////////////////////////////////
//  Base functions
////////////////////////////////

function wordValuation(word) {
    let r = mulberry32(word.length);
    let res = Math.floor(r * 10 * word.length) + (word.length % 66);
    console.log(res);
    return res;
}

function translate() {
    //split the text to get each word
    let lst = config.TEXT.split(new RegExp("\\s+"));
    let ori = config.START_ORI;
    let spacing = 1;
    let oldSpacing = 1;

    //loop over each word
    lst.forEach((word) => {
        if (word.length > 0) {
            //translate the word into dominoes
            let dominosList = giveDominos(wordValuation(word), DOMINOS[ori]);

            //handle spacing
            oldSpacing = spacing;

            if (spacing >= dominosList.length && ori === "x") {
                spacing -= dominosList.length - 1;
            }

            let dominosSpace = `<span class="invisible">
            ${SPE_DOMINOS.x["?-?"].repeat(spacing)}
        </span>`;
            //

            if (ori === "x") {
                outputElement.innerHTML += dominosSpace;
                outputElement.innerHTML += dominosList.join("") + "<br>";

                //handle spacing change
                if (oldSpacing == spacing) {
                    spacing += dominosList.length - 1;
                }
            } else {
                dominosList.forEach((dom) => {
                    outputElement.innerHTML += dominosSpace;
                    outputElement.innerHTML += dom + "<br>";
                });
            }
            //clean output for dominos
            console.log("%c" + dominosList.join(""), "font-size: 24px");

            //switch direction
            ori = ori === "x" ? "y" : "x";
        }
    });
}

////////////////////////////////
//  Main functions
////////////////////////////////

function main() {
    initJson();

    inputElement.addEventListener("input", (ev) => {
        config.TEXT = ev.target.value;
        outputElement.innerHTML = "";
        translate();
    });
}

main();
