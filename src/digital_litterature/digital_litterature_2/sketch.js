let config = {
    TEXT: "",
    //UI Data
    CELL_SIZE: 10,
    START_ORI: "x",

    //the bigger the more dominos
    MAX_VALUATION: 300,
    SPACING: 0,
};

const outputElement = document.getElementById("output");
const inputElement = document.getElementById("input");

////////////////////////////////
//  ADDITIONAL STUFF
////////////////////////////////

////////////////////////////////
//  Dominos JSON creation
////////////////////////////////

const DOMINOS = {
    y: {},
    x: {},
};

const BLANK_DOMINO = {
    y: "🁢",
    x: "🀰",
};

//random at start
let previousDomino = "-1";
let previousWordFirstDomino = "-1";

//fill the json
function initJson() {
    //add dominoes
    appendCharInRange(0x1f032, 0x1f061, DOMINOS.x); //127026–127073 UNICODE range
    appendCharInRange(0x1f064, 0x1f093, DOMINOS.y); //127076–127123 UNICODE range

    DOMINOS.x["-1"] = "🀰";
    DOMINOS.y["-1"] = "🁢";
    console.log(DOMINOS);
}

//return the list of char included in the range
function appendCharInRange(st, nd, json) {
    let sub_index = 1;
    for (let i = st; i <= nd; i++) {
        //UNICODE dominos order goes 0-1, 0-0, ... 6-6
        const row = Math.floor(sub_index / 7);
        const col = sub_index % 7;

        //name objet accordingly "X-Y"
        json[`${row}${col}`] = String.fromCodePoint(i);
        sub_index++;
    }
}

//function that give domino keys, excluding -1
function getDominosKeys(ori) {
    let keys = Object.keys(DOMINOS[ori]);

    return keys.filter((k) => k != "-1");
}

////////////////////////////////
//  Domino generation
////////////////////////////////

//generate a value based on the word
function wordValuation(word) {
    let fullNum = "";
    let sum = 0;

    //word = ab, a = 111, b = 112, fullNum = 111112
    for (const c of word) {
        fullNum += String(c.charCodeAt(0));
    }

    //fullNum = 1,2,3
    for (const n in fullNum) {
        sum += Number(n);
    }

    //word length to avoid repetition of pattern for two different word
    //+10 to avoid emptiness
    return sum + 10 + word.length;
}

//pick a random keys of JSON
function pickRandomKey(seed, keys) {
    return keys[Math.floor(mulberry32(seed) * keys.length)];
}

//give dominos that can be played regarding previous or/and next
function getPlayableDominoKeys(previous = null, next = null, ori) {
    const keys = getDominosKeys(ori);

    return keys.filter(
        (k) =>
            (previous != null ? previous == k[0] : true) &&
            (next != null ? next == k[1] : true)
    );
}

function dominoChain(value, ori) {
    chain = [];

    value %= config.MAX_VALUATION;

    //update previous domino (in case its a -1)
    if (previousDomino == "-1") {
        //generate a random one (pseudo random based on value)
        const keys = getDominosKeys(ori);
        previousDomino = pickRandomKey(value, keys);
    }

    //generate a domino chain according to the valuation
    while (value > 0) {
        //get dominos that connect to previously played one
        let candidatesKeys = getPlayableDominoKeys(
            previousDomino[1],
            null,
            ori
        );

        //get the one that by substracting won't exceed value
        let safeCandidatesKeys = candidatesKeys.filter(
            (k) => Number(k) <= value
        );

        //fill if empty
        if (safeCandidatesKeys.length === 0) {
            //choose the one you can play as those who exceed
            safeCandidatesKeys = candidatesKeys;
        }

        //choose random one
        let choice = pickRandomKey(value, safeCandidatesKeys);

        //play it
        previousDomino = choice;
        value -= Number(choice);

        //add it to the chain
        chain.push(choice);
    }

    return chain;
}

function dominoChainWord(word, ori) {
    const v = wordValuation(word);
    return dominoChain(v, ori);
}

function dominoChainText(text) {
    let words = text.trim().split(/\s+/);
    let ori = config.START_ORI;
    config.SPACING = 1; //reset spacing

    words.forEach((word) => {
        if (word.length > 0) {
            let chain = dominoChainWord(word, ori);

            //render the chain
            renderDominoChain(chain, ori);
            //switch orientation
            ori = ori === "x" ? "y" : "x";
        }
    });
}

function renderDominoChain(chain, ori) {
    let oldSpacing = config.SPACING;

    //handle spacing going back (= inverse the chain)
    if (config.SPACING >= chain.length && ori === "x") {
        config.SPACING -= chain.length - 1;

        //reverse the chain AND rotate each domino
        chain = chain.reverse().map((k) => {
            return k[1] + k[0];
        });
    }

    //render the text of domino
    let dominoChain = chain.map((k) => {
        return DOMINOS[ori][k];
    });

    let dominoSpace = `<span class="invisible">
            ${BLANK_DOMINO.x.repeat(config.SPACING)}
        </span>`;

    if (ori === "x") {
        outputElement.innerHTML += dominoSpace;
        outputElement.innerHTML += dominoChain.join("") + "<br>";

        //handle spacing going forward
        if (oldSpacing == config.SPACING) {
            config.SPACING += dominoChain.length - 1;
        }
    } else {
        dominoChain.forEach((dom) => {
            outputElement.innerHTML += dominoSpace;
            outputElement.innerHTML += dom + "<br>";
        });
    }
}

////////////////////////////////
//  Base functions
////////////////////////////////

//https://github.com/cprosche/mulberry32 deterministic random with seed
function mulberry32(seed) {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

////////////////////////////////
//  Main functions
////////////////////////////////

function main() {
    initJson();

    inputElement.addEventListener("input", (ev) => {
        config.TEXT = ev.target.value;
        outputElement.innerHTML = "";

        //TEST
        let t = dominoChainText(config.TEXT);

        //translate();
    });
}

main();
