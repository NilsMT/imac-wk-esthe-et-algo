let config = {
    //UI Data
    CANVAS_HEIGHT: 800,
    CANVAS_WIDTH: 800,
    SPACE_CODE: 32,
    DOMINOS: [
        //X dominos (0-12)
        "🁣",
        "🁤",
        "🁥",
        "🁦",
        "🁧",
        "🁨",
        "🁩",
        "🁰",
        "🁷",
        "🁾",
        "🂅",
        "🂌",
        "🂓",
        //X+12 dominos (12-24)
        "🀲",
        "🀳",
        "🀴",
        "🀵",
        "🀶",
        "🀷",
        "🀾",
        "🁅",
        "🁌",
        "🁓",
        "🁚",
        "🁡",
    ],
};

///////////////////////////////////

function generateText(txt) {
    let dominoEquiv = "";

    //loop each char of input
    for (let i = 0; i < txt.length; i++) {
        let char = txt[i];

        let code = char.charCodeAt(0);
        dominoEquiv += getDominoesChar(code) + "🁢"; //get equivalent in dominos + separator char
    }

    return dominoEquiv;
}

function getDominoesChar(code) {
    const dominoCount = config.DOMINOS.length;
    let str = "";

    if (code == config.SPACE_CODE) {
        return config.DOMINOS[0];
    }

    while (code > 0) {
        //pick the largest domino whose index <= code
        for (let i = dominoCount - 1; i >= 0; i--) {
            if (i <= code) {
                str += config.DOMINOS[i];
                code -= i;
                break;
            }
        }
    }

    return str;
}

///////////////////////////////////

const inputElement = document.getElementById("input");
const outputElement = document.getElementById("output");

//translate txt into dominos
function translate(txt) {
    outputElement.textContent = generateText(txt);
}

//fetch random quote from API
function translateRandomQuote() {
    fetch("https://api.kanye.rest/")
        .then((response) => response.json())
        .then((data) => {
            inputElement.value = data.quote;

            translate(data.quote);
        })
        .catch((error) => console.error("Error fetching quote:", error));
}

function main() {
    document.getElementById("input");
    const btn = document.getElementById("regen");

    //input listener for typing
    inputElement.addEventListener("input", (ev) => {
        translate(ev.target.value);
    });

    //btn listener
    btn.addEventListener("click", () => {
        translateRandomQuote();
    });
}

main(); //SETUP

//RUN ONCE
translateRandomQuote();

////////////////////////////////
//  Config customization
////////////////////////////////

const configEditor = document.getElementById("configEditor");
const applyConfigBtn = document.getElementById("applyConfig");
const resetConfigBtn = document.getElementById("resetConfig");

//keep a clean copy
const DEFAULT_CONFIG = JSON.parse(JSON.stringify(config));

//init textarea
configEditor.value = JSON.stringify(config, null, 2);

//apply whatever is typed
applyConfigBtn.addEventListener("click", () => {
    config = JSON.parse(configEditor.value);
    translate(inputElement.value);
});

//reset JSON
resetConfigBtn.addEventListener("click", () => {
    config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    configEditor.value = JSON.stringify(config, null, 2);
});
