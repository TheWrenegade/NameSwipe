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
