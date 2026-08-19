/* ==================================
   Baby Name Picker - Shortlist
   ================================== */
console.log("SHORTLIST.JS LOADED");

/* ==================================
   Shortlist State
   ================================== */

let shortlistNames = [];

let maleNames = [];

let femaleNames = [];

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


async function loadShortlist() {

    shortlistNames =
        await loadShortlistNamesFromSheet();


    console.log(
        "Shortlist loaded:",
        shortlistNames.length
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


    /*
        Restore this user's saved
        ranking.
    */

    await loadShortlistProgress();


    console.log(
        "Final male order:",
        maleNames.map(
            name => name.name
        )
    );


    console.log(
        "Final female order:",
        femaleNames.map(
            name => name.name
        )
    );


    return shortlistNames;

}

/* ==================================
   Shortlist Firebase Persistence
   ================================== */


/*
    Save the current shortlist order
*/

async function saveShortlistProgress() {

    if (!appState.currentUser) {

        console.log(
            "Cannot save shortlist: no user selected."
        );

        return;

    }


    const progress = {

        male:
            maleNames.map(
                name => name.name
            ),

        female:
            femaleNames.map(
                name => name.name
            )

    };


    console.log(
        "Saving shortlist:",
        progress
    );


    await database
        .ref(
            "users/" +
            appState.currentUser +
            "/shortlist"
        )
        .set(progress);

}


/*
    Load the user's saved shortlist order
*/

async function loadShortlistProgress() {

    if (!appState.currentUser) {

        console.log(
            "Cannot load shortlist: no user selected."
        );

        return false;

    }


    const snapshot =
        await database
            .ref(
                "users/" +
                appState.currentUser +
                "/shortlist"
            )
            .once("value");


    const progress =
        snapshot.val();


    console.log(
        "Shortlist Firebase data:",
        progress
    );


    /*
        No saved shortlist yet.
        Keep the Google Sheet order.
    */

    if (!progress) {

        console.log(
            "No saved shortlist order."
        );

        await saveShortlistProgress();

        return false;

    }


    /*
        Restore male order
    */

    if (
        Array.isArray(progress.male)
    ) {

        maleNames =
            restoreShortlistOrder(
                maleNames,
                progress.male
            );

    }


    /*
        Restore female order
    */

    if (
        Array.isArray(progress.female)
    ) {

        femaleNames =
            restoreShortlistOrder(
                femaleNames,
                progress.female
            );

    }


    return true;

}


/*
    Rebuild a name list using
    the saved order.
*/

function restoreShortlistOrder(
    names,
    savedOrder
) {

    const restored = [];


    /*
        Add names in saved order
    */

    savedOrder.forEach(
        savedName => {

            const name =
                names.find(
                    name =>
                        name.name === savedName
                );


            if (name) {

                restored.push(name);

            }

        }
    );


    /*
        Add any names that exist in
        the spreadsheet but weren't
        in the saved Firebase order.
    */

    names.forEach(name => {

        const alreadyIncluded =
            restored.some(
                restoredName =>
                    restoredName.name === name.name
            );


        if (!alreadyIncluded) {

            restored.push(name);

        }

    });


    return restored;

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
    async () => {

        moveNameUp(
            list,
            index
        );


        await saveShortlistProgress();


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
    async () => {

        moveNameDown(
            list,
            index
        );


        await saveShortlistProgress();


        renderShortlist();

    }
);


    controls.appendChild(upButton);

    controls.appendChild(downButton);


    /* ==========================
       Expand Button
       ========================== */

    /* const expandButton =
        document.createElement("button");


    expandButton.type =
        "button";


    expandButton.className =
        "shortlist-expand";


    expandButton.textContent =
        "▾";


    expandButton.title =
        "Show details"; */


    /* ==========================
       Header Assembly
       ========================== */

    header.appendChild(rank);

    header.appendChild(nameButton);

    header.appendChild(controls);

    /* header.appendChild(expandButton); */


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

   nameButton.addEventListener(
    "click",
    () => {

        details.hidden =
            !details.hidden;

    }
);


    return row;

}

    /* ==========================
       Expand / Collapse
       ========================== */

   /* expandButton.addEventListener(
        "click",
        () => {

            details.hidden =
                !details.hidden;


            expandButton.textContent =
                details.hidden
                    ? "▾"
                    : "▴";

        }
    ); */


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

async function initializeShortlist() {

    await loadShortlist();

    renderShortlist();

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

window.renderShortlist =
    renderShortlist;

window.initializeShortlist =
    initializeShortlist;

document
    .getElementById("shortlist-button")
    .addEventListener(
        "click",
        async () => {

            console.log("Shortlist button clicked.");

            showScreen("shortlist");

            try {

                await initializeShortlist();

            } catch (error) {

                console.error(
                    "Error loading shortlist:",
                    error
                );

            }

        }
    );
