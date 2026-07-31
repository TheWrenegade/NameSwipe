/* ==================================
   Baby Name Picker - Results
   ================================== */


const RESULTS_STORAGE_KEY =
    "babyNameProgress";



function getResultsData() {


    const saved =
        localStorage.getItem(
            RESULTS_STORAGE_KEY
        );


    if (!saved) {

        return null;

    }


    return JSON.parse(saved);

}




function compareRatings() {


    const data =
        getResultsData();


    if (!data || !data.users) {

        return [];

    }


    const wren =
        data.users.wren?.ratings || {};


    const elijah =
        data.users.elijah?.ratings || {};



    const names =
        new Set([
            ...Object.keys(wren),
            ...Object.keys(elijah)
        ]);



    return [...names].map(name => {


        return {

            name: name,

            wren:
                wren[name]?.rating || null,

            elijah:
                elijah[name]?.rating || null,

            wrenNotes:
                wren[name]?.notes || "",

            elijahNotes:
                elijah[name]?.notes || ""

        };


    });


}




function renderResults() {


    const results =
        compareRatings();



    const strongMatches =
    results.filter(item => {

        const pair =
            [
                item.wren,
                item.elijah
            ];

        return (

            pair.includes("love") &&
            (
                pair.includes("love") ||
                pair.includes("like")
            )

        );

    });


	const agreeable =
	results.filter(item => {

        const pair =
            [
                item.wren,
                item.elijah
            ];


        return (

            pair.includes("like") &&
            (
                pair.includes("like") ||
                pair.includes("maybe")
            )

        );

    });



	const discuss =
    results.filter(item => {

        const pair =
            [
                item.wren,
                item.elijah
            ];


        return (

            pair.includes("maybe") &&
            !(
                pair.includes("love") ||
                pair.includes("like")
            )

        );

    });



	const passed =
    results.filter(item =>

        item.wren === "pass" &&
        item.elijah === "pass"

    );



	displayResultGroup(
		"strong-matches-list",
		strongMatches
	);


	displayResultGroup(
		"agreeable-matches-list",
		agreeable
	);


	displayResultGroup(
		"discuss-list",
		discuss
	);

}


function displayResultGroup(
    elementID,
    names
) {


    const container =
        document.getElementById(
            elementID
        );


    container.innerHTML = "";



    if (names.length === 0) {


        container.innerHTML =
            "<p>No names yet.</p>";


        return;

    }



    names.forEach(name => {


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "result-card";



        card.innerHTML = `

            <h4>
                ${name.name}
            </h4>


            <p>
                👩 Wren:
                ${name.wren || "—"}
            </p>

            <p>
                ❤️ Elijah:
                ${name.elijah || "—"}
            </p>


            <div class="result-notes">

                <p>
                    <strong>Wren:</strong>
                    ${name.wrenNotes || "—"}
                </p>


                <p>
                    <strong>Elijah:</strong>
                    ${name.elijahNotes || "—"}
                </p>

            </div>

        `;


        container.appendChild(card);


    });


}




document.addEventListener(
    "DOMContentLoaded",
    () => {

        const resultsButton =
            document.getElementById(
                "results-btn"
            );


        console.log(
            "Results button:",
            resultsButton
        );


        if (resultsButton) {

            resultsButton.addEventListener(
                "click",
                () => {

                    console.log(
                        "Results button clicked"
                    );


                    showScreen("results");


                    renderResults();

                }
            );

        }

    }
);

document
    .getElementById("view-results-btn")
    .addEventListener(
        "click",
        () => {

            console.log(
                "View Results clicked"
            );

            showScreen("results");

            renderResults();

        }
    );
document
    .getElementById("export-btn")
    .addEventListener(
        "click",
        exportShortlist
    );


function exportShortlist() {

    const results =
        compareRatings();


    const shortlist =
        results.filter(name => {

            const ratings = [
                name.wren,
                name.elijah
            ];


            return (
                ratings.includes("love") ||
                ratings.includes("like") ||
                ratings.includes("maybe")
            );

        });



    let csv =
        "Name,Wren Rating,Elijah Rating,Wren Notes,Elijah Notes\n";


    shortlist.forEach(name => {


        csv += [
            name.name,
            name.wren || "",
            name.elijah || "",
            escapeCSV(name.wrenNotes),
            escapeCSV(name.elijahNotes)

        ].join(",") + "\n";


    });



    downloadCSV(
        csv,
        "Baby_Name_Shortlist.csv"
    );

}



function escapeCSV(value) {

    if (!value) {
        return "";
    }


    return `"${value.replaceAll('"','""')}"`;

}



function downloadCSV(
    csv,
    filename
) {

    const blob =
        new Blob(
            [csv],
            {
                type:
                "text/csv"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        filename;


    link.click();


    URL.revokeObjectURL(url);

}
