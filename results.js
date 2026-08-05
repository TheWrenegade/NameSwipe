/* ==================================
   Baby Name Picker - Results
   ================================== */

async function getResultsData() {

    const snapshot =
        await database
            .ref("users")
            .once("value");

    return snapshot.val();

}




function compareRatings(data) {

    if (!data) {
        return [];
    }

    const wren =
        data.wren?.ratings || {};

    const elijah =
        data.elijah?.ratings || {};



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

async function renderResults() {


  const data =
    await getResultsData();

  const results =
    compareRatings(data);



    const strongMatches =
    results.filter(item => {

        return (

            (item.wren === "love" && item.elijah === "love") ||

            (item.wren === "love" && item.elijah === "like") ||

            (item.wren === "like" && item.elijah === "love")

        );

    });

	const agreeable =
    results.filter(item => {

        return (

            (item.wren === "like" && item.elijah === "like") ||

            (item.wren === "like" && item.elijah === "maybe") ||

            (item.wren === "maybe" && item.elijah === "like")

        );

    });



	const discuss =
    results.filter(item => {

        return (

            item.wren !== "pass" &&
            item.elijah !== "pass" &&

            !strongMatches.includes(item) &&
            !agreeable.includes(item)

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
            document.getElementById("results-btn");

        if (resultsButton) {

            resultsButton.addEventListener(
                "click",
                async () => {

                    showScreen("results");
                    await renderResults();

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
    	async () => {

        await exportShortlist();

    }
);


async function exportShortlist() {

    const data = await getResultsData();

    const results = compareRatings(data);

    const shortlist = results.filter(item =>
        item.wren !== "pass" &&
        item.elijah !== "pass"
    );

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
