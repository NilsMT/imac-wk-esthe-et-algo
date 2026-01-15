let config = {
    TEXT: "",
    //UI Data
    CELL_SIZE: 10,
    START_ORI: "x",
};

const outputElement = document.getElementById("output");
const inputElement = document.getElementById("input");

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

//turn char to html entity so it display
function charToHtmlEntity(char) {
    const code = char.codePointAt(0);
    return `&#${code};`; // decimal
}

//turn X-Y into XY
function getDominoValue(k) {
    return Number(k.replace("-", ""));
}

//turn X-Y into [X,Y]
function splitDominoValue(k) {
    return k.split("-").map((m) => Number(m));
}

//fill the json
function initJson() {
    //add dominoes
    appendCharInRange(0x1f031, 0x1f061, DOMINOS.x); //127025–127073 UNICODE range
    appendCharInRange(0x1f063, 0x1f093, DOMINOS.y); //127075–127123 UNICODE range

    console.log(DOMINOS);
    console.log(SPE_DOMINOS);
}

//orientation is "x" or "y"
function giveAdequateDominos(code, json) {
    let result = "";
    let ori = json["0-0"] === DOMINOS["x"]["0-0"] ? "x" : "y";
    let keys = Object.keys(json);

    //loop until no more to give
    while (code > 0) {
        //stop if previous domino is [0,0]
        if (previousDomino[0] === 0 && previousDomino[1] === 0) {
            break;
        }

        //initialize previousDomino if it's the joker state
        if (previousDomino[0] === -1 && previousDomino[1] === -1) {
            previousDomino = [0, code % 7];
        }

        // select subtraction candidates
        let candidates = keys.filter((k) => {
            let sp = splitDominoValue(k); //[start, end]
            let val = getDominoValue(k); //X*10 + Y

            let fit = val <= code; //can this domino fit numerically?
            let canBePlayed = sp[0] === previousDomino[1]; //must match previous domino's end

            return fit && canBePlayed;
        });

        if (candidates.length > 0) {
            //choose one of them at random
            let choice = Math.floor(Math.random() * candidates.length);
            let chosenKey = candidates[choice];

            let choseVal = getDominoValue(chosenKey);
            let choseSp = splitDominoValue(chosenKey);

            //add to result
            result += (ori === "x" ? "" : "<br>") + json[chosenKey];
            previousDomino = choseSp;

            //subtract choice, then reiterate
            code -= choseVal;
        } else {
            //no candidate found, end of chain
            break;
        }
    }

    //add end character (so everything can be played after)
    result += (ori === "x" ? "" : "<br>") + SPE_DOMINOS[ori]["?-?"];
    previousDomino = [-1, -1];
    return result;
}

////////////////////////////////
//  Base functions
////////////////////////////////

function translate() {
    //split the text to get each word
    let lst = config.TEXT.split(" ");
    let ori = config.START_ORI;

    //loop over each word
    lst.forEach((word) => {
        //translate the word into dominoes
        let adequateWord = word
            .split("")
            .map((char) => {
                //translate each char of word
                let code = char.charCodeAt(0);
                return giveAdequateDominos(code, DOMINOS[ori]);
            })
            .join("");

        console.warn(word);
        console.log("%c" + adequateWord, "font-size: 24px");

        outputElement.innerHTML += adequateWord + "<br>";

        //switch direction
        ori = ori === "x" ? "y" : "x";
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
