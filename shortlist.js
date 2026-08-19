/* ==================================
   Baby Name Picker - Shortlist
   ================================== */


/* ==================================
   Shortlist State
   ================================== */

let shortlistNames = [];

let maleNames = [];

let femaleNames = [];


/* ==================================
   Google Sheet
   ================================== */

const SHORTLIST_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXhxVGEejVjt_sYGAvvbJ4kt-yEKkQztBinnYkvaDHtZIiknqxSJJdM_zRMGFc4WcQJtmCD3vXAdLX/pub?gid=872769428&single=true&output=csv";


/* ==================================
   Load Shortlist
   ================================== */

async function loadShortlistNamesFromSheet() {

    const response =
        await fetch(SHORTLIST_SHEET_URL);

    const csv =
        await response.text();

    const rows =
        csvToArray(csv);

    const headers =
        rows.shift();

    return rows
        .filter(row => row[0]?.trim())
        .map(row => {

            const name = {};

            headers.forEach(
                (header, index) => {

                    name[header.trim()] =
                        row[index]?.trim() || "";

                }
            );


            return {

                name:
                    name.Name,

                sex:
                    name.Sex,

                origin:
                    name.Origin,

                reference:
                    name.Reference,

                nicknames:
                    name.Nicknames,

                syllables:
                    Number(name.Syllables),

                acquaintance:
                    name.Acquaintance,

                generalNotes:
                    name.Notes,

                elijahNotes:
                    name["Elijah-Notes"],

                wrenNotes:
                    name["Wren-Notes"],

                ranking:
                    name["2025 Ranking"]

            };

        });

}


/* ==================================
   Load Shortlist
   ================================== */

async function loadShortlist() {

    shortlistNames =
        await loadShortlistNamesFromSheet();


    console.log(
        "Shortlist loaded:",
        shortlistNames.length,
        shortlistNames
    );


    maleNames =
        shortlistNames.filter(
            name =>
                name.sex.toLowerCase() === "male"
        );


    femaleNames =
        shortlistNames.filter(
            name =>
                name.sex.toLowerCase() === "female"
        );


    console.log(
        "Male names:",
        maleNames
    );


    console.log(
        "Female names:",
        femaleNames
    );


    return shortlistNames;

}

/* ==================================
   Render Shortlist
   ================================== */

function renderShortlist() {

    renderShortlistSection(
        maleNames,
        "male-shortlist"
    );

    renderShortlistSection(
        femaleNames,
        "female-shortlist"
    );

}


/* ==================================
   Render One Section
   ================================== */

function renderShortlistSection(
    names,
    containerId
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) return;


    container.innerHTML = "";


    names.forEach(
        (name, index) => {

            const row =
                createShortlistRow(
                    name,
                    index,
                    names
                );


            container.appendChild(row);

        }
    );

}


/* ==================================
   Create Shortlist Row
   ================================== */

function createShortlistRow(
    name,
    index,
    list
) {

    const row =
        document.createElement("div");


    row.className =
        "shortlist-row";


    /* ==========================
       Header
       ========================== */

    const header =
        document.createElement("div");


    header.className =
        "shortlist-row-header";


    /* Rank */

    const rank =
        document.createElement("span");


    rank.className =
        "shortlist-rank";


    rank.textContent =
        `${index + 1}.`;


    /* Name */

    const nameButton =
        document.createElement("button");


    nameButton.type =
        "button";


    nameButton.className =
        "shortlist-name";


    nameButton.textContent =
        name.name;


    /* Move buttons */

    const controls =
        document.createElement("div");


    controls.className =
        "shortlist-controls";


    const upButton =
        document.createElement("button");


    upButton.type =
        "button";


    upButton.className =
        "shortlist-move";


    upButton.textContent =
        "↑";


    upButton.title =
        "Move up";


    upButton.disabled =
        index === 0;


    upButton.addEventListener(
        "click",
        () => {

            moveNameUp(
                list,
                index
            );

            renderShortlist();

        }
    );


    const downButton =
        document.createElement("button");


    downButton.type =
        "button";


    downButton.className =
        "shortlist-move";


    downButton.textContent =
        "↓";


    downButton.title =
        "Move down";


    downButton.disabled =
        index === list.length - 1;


    downButton.addEventListener(
        "click",
        () => {

            moveNameDown(
                list,
                index
            );

            renderShortlist();

        }
    );


    controls.appendChild(upButton);

    controls.appendChild(downButton);


    /* ==========================
       Expand Button
       ========================== */

    const expandButton =
        document.createElement("button");


    expandButton.type =
        "button";


    expandButton.className =
        "shortlist-expand";


    expandButton.textContent =
        "▾";


    expandButton.title =
        "Show details";


    /* ==========================
       Header Assembly
       ========================== */

    header.appendChild(rank);

    header.appendChild(nameButton);

    header.appendChild(controls);

    header.appendChild(expandButton);


    row.appendChild(header);


    /* ==========================
       Details
       ========================== */

    const details =
        document.createElement("div");


    details.className =
        "shortlist-details";


    details.hidden =
        true;


    details.innerHTML = `

        <div class="shortlist-detail">

            <strong>Origin:</strong>

            <span>
                ${displayValue(name.origin)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Reference:</strong>

            <span>
                ${displayValue(name.reference)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Nicknames:</strong>

            <span>
                ${displayValue(name.nicknames)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Syllables:</strong>

            <span>
                ${displayValue(name.syllables)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Acquaintance:</strong>

            <span>
                ${displayValue(name.acquaintance)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>2025 Ranking:</strong>

            <span>
                ${displayValue(name.ranking)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Notes:</strong>

            <span>
                ${displayValue(name.generalNotes)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Elijah's Notes:</strong>

            <span>
                ${displayValue(name.elijahNotes)}
            </span>

        </div>


        <div class="shortlist-detail">

            <strong>Wren's Notes:</strong>

            <span>
                ${displayValue(name.wrenNotes)}
            </span>

        </div>

    `;


    row.appendChild(details);


    /* ==========================
       Expand / Collapse
       ========================== */

    expandButton.addEventListener(
        "click",
        () => {

            details.hidden =
                !details.hidden;


            expandButton.textContent =
                details.hidden
                    ? "▾"
                    : "▴";

        }
    );


    nameButton.addEventListener(
        "click",
        () => {

            details.hidden =
                !details.hidden;


            expandButton.textContent =
                details.hidden
                    ? "▾"
                    : "▴";

        }
    );


    return row;

}


/* ==================================
   Display Empty Values
   ================================== */

function displayValue(value) {

    if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(value)
    ) {

        return "—";

    }


    return value;

}

/* ==================================
   Move Name
   ================================== */

function moveName(
    list,
    index,
    direction
) {

    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= list.length
    ) {

        return;

    }


    const temp =
        list[index];


    list[index] =
        list[newIndex];


    list[newIndex] =
        temp;


    console.log(
        "New order:",
        list.map(
            name => name.name
        )
    );

}


/* ==================================
   Move Up
   ================================== */

function moveNameUp(
    list,
    index
) {

    moveName(
        list,
        index,
        -1
    );

}


/* ==================================
   Move Down
   ================================== */

function moveNameDown(
    list,
    index
) {

    moveName(
        list,
        index,
        1
    );

}


/* ==================================
   Global Access
   ================================== */

window.loadShortlist =
    loadShortlist;

window.loadShortlistNamesFromSheet =
    loadShortlistNamesFromSheet;

window.moveNameUp =
    moveNameUp;

window.moveNameDown =
    moveNameDown;

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadShortlist();

        renderShortlist();

    }
);

window.renderShortlist =
    renderShortlist;

document
    .getElementById("shortlist-button")
    .addEventListener(
        "click",
        () => {

            showScreen("shortlist");

        }
    );

document
    .getElementById("shortlist-back-button")
    .addEventListener(
        "click",
        () => {

            showScreen("rating");

        }
    );
