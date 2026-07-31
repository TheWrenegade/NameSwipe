/* ==================================
   Baby Name Picker - API
   ================================== */


const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXhxVGEejVjt_sYGAvvbJ4kt-yEKkQztBinnYkvaDHtZIiknqxSJJdM_zRMGFc4WcQJtmCD3vXAdLX/pub?gid=0&single=true&output=csv";



async function loadNamesFromSheet() {


    const response =
        await fetch(SHEET_URL);


    const csv =
        await response.text();



    const rows =
        csvToArray(csv);



    const headers =
        rows.shift();



    return rows.map(row => {


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


            ranking:
                Number(name["2025 Ranking"])


        };


    });


}



/*
    Basic CSV parser

    Handles commas inside quotes
*/

function csvToArray(csv) {


    const lines =
        csv.split("\n");


    return lines.map(line => {


        const values = [];

        let current = "";

        let insideQuotes = false;



        for (let char of line) {


            if (char === '"') {

                insideQuotes =
                    !insideQuotes;

            }

            else if (
                char === "," &&
                !insideQuotes
            ) {

                values.push(current);
                current = "";

            }

            else {

                current += char;

            }

        }


        values.push(current);


        return values;


    });


}



window.loadNamesFromSheet =
    loadNamesFromSheet;