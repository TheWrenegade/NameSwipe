
/* ==================================
   Rating State
   ================================== */


let currentIndex = 0;

let shuffledNames = [];

let sampleNames = [];

let selectedRating = null;

let previousAction = null;

/* ==================================
   Firebase Storage
   ================================== */

const STORAGE_KEY = "babyNameProgress";


function getCurrentRatings() {

    const ratings = {};


    shuffledNames.forEach(name => {

        ratings[name.name] = {

            rating:
                name.userRating || null,

            notes:
                name.userNotes || ""

        };

    });


    return ratings;

}



function saveProgress() {


    const progress = {

        currentIndex:
            currentIndex,

        order:
            shuffledNames.map(
                name => name.name
            ),

        ratings:
            getCurrentRatings()

    };


    return database
        .ref(
            "users/" + appState.currentUser
        )
        .set(progress);


}

           shuffledNames =
                progress.order
                    .map(savedName =>
                        sampleNames.find(
                            name =>
                                name.name === savedName
                        )
                    )
                    .filter(Boolean);



            Object.keys(
                progress.ratings || {}
            ).forEach(nameKey => {


                const saved =
                    progress.ratings[nameKey];


                const name =
                    shuffledNames.find(
                        name =>
                            name.name === nameKey
                    );


                if (name) {

                    name.userRating =
                        saved.rating;


                    name.userNotes =
                        saved.notes;

                }


            });



            currentIndex = findNextUnratedName();



            return true;


        });


}

/* ==================================
   Initialize Rating System
   ================================== */

async function initializeRatings() {

    await loadProgress();

    appState.names = shuffledNames;

    displayCurrentName();

    updateProgress();

    setupRatingButtons();

    document
        .getElementById("user-notes")
        .addEventListener("input", () => {

            const name = shuffledNames[currentIndex];

            if (!name) return;

            name.userNotes =
                document.getElementById("user-notes").value;

            saveProgress();

        });

}

async function loadProgress() {

    const loadedNames =
        await loadNamesFromSheet();

    sampleNames =
        loadedNames;


    const snapshot =
        await database
            .ref(
                "users/" + appState.currentUser
            )
            .once("value");


    const progress =
        snapshot.val();


    // No previous progress = start fresh
    if (!progress) {

        shuffledNames =
            shuffleArray(
                [...sampleNames]
            );

        currentIndex = 0;

        return false;

    }


    /*
       Restore existing order
    */

    shuffledNames =
        progress.order
            .map(savedName =>
                sampleNames.find(
                    name =>
                        name.name === savedName
                )
            )
            .filter(Boolean);



    /*
       Add new names from spreadsheet
    */

    const existingNames =
        new Set(
            shuffledNames.map(
                name => name.name
            )
        );


    const newNames =
        sampleNames.filter(
            name =>
                !existingNames.has(name.name)
        );


    if (newNames.length > 0) {

        console.log(
            "Adding new names:",
            newNames.map(
                name => name.name
            )
        );


        shuffledNames.push(
            ...shuffleArray(newNames)
        );

    }



    /*
       Restore ratings
    */

    Object.keys(
        progress.ratings || {}
    ).forEach(nameKey => {


        const saved =
            progress.ratings[nameKey];


        const name =
            shuffledNames.find(
                name =>
                    name.name === nameKey
            );


        if (name) {

            name.userRating =
                saved.rating;


            name.userNotes =
                saved.notes;

        }


    });



    /*
       Find next unfinished name
    */

    currentIndex =
        findNextUnratedName();



    /*
       Save updated list back
       so new names persist
    */

    await saveProgress();



    return true;

}


/* ==================================
   Shuffle
   ================================== */


function shuffleArray(array) {


    return array.sort(
        () => Math.random() - 0.5
    );


}

function findNextUnratedName() {


    const index =
        shuffledNames.findIndex(
            name => !name.userRating
        );


    return index === -1
        ? 0
        : index;


}

function updateProgress() {

    const total =
        shuffledNames.length;

    const rated =
        shuffledNames.filter(
            name => name.userRating
        ).length;


    document.getElementById(
        "progress-count"
    ).textContent =
        `${rated} / ${total} Rated`;


    const percent =
        total === 0
            ? 0
            : Math.round(
                (rated / total) * 100
            );


    document.getElementById(
        "progress-percent"
    ).textContent =
        `${percent}%`;


    document.getElementById(
        "progress-fill"
    ).style.width =
        `${percent}%`;

}

/* ==================================
   Display Name
   ================================== */


	function displayCurrentName() {


		const name =
		shuffledNames[currentIndex];


	if (!name) {

		console.log("Finished!");

		return;

	}


    document.getElementById("name")
        .textContent =
        name.name;


    document.getElementById("sex-pill")
        .textContent =
        name.sex;


    document.getElementById("origin")
        .textContent =
        name.origin;


    document.getElementById("ranking")
        .textContent =
        "#" + name.ranking;


    document.getElementById("syllables")
        .textContent =
        name.syllables;


    document.getElementById("nicknames")
        .textContent =
        name.nicknames;


    document.getElementById("reference")
        .textContent =
        name.reference;


    document.getElementById("acquaintance")
        .textContent =
        name.acquaintance;


    clearRatingState();

	document.getElementById("user-notes").value =
		name.userNotes || "";

}



/* ==================================
   Rating Buttons
   ================================== */


function setupRatingButtons() {


    document
        .querySelectorAll(".rating[data-rating]")
        .forEach(button => {


            button.addEventListener(
                "click",
                () => {


                    rateName(
                        button.dataset.rating
                    );


                }
            );


        });


    document
        .getElementById("skip-button")
        .addEventListener(
            "click",
            skipName
        );

	document
	    .getElementById("undo-button")
	    .addEventListener(
	        "click",
	        undoRating
	    );


}



function rateName(rating) {


    const name =
        shuffledNames[currentIndex];


    console.log(
        name.name,
        "rated:",
        rating
    );

	previousAction = {
	    index: currentIndex,
	    name: name.name,
	    oldRating: name.userRating || null,
	    oldNotes: name.userNotes || ""
	};

    name.userRating =
        rating;


    name.userNotes =
        document.getElementById(
            "user-notes"
        ).value;


    saveProgress();
	updateProgress();


    selectedRating =
        rating;


    moveToNextName();


}

function undoRating() {

    if (!previousAction) {

        console.log("Nothing to undo");
        return;

    }


    const name =
        shuffledNames[previousAction.index];


    name.userRating =
        previousAction.oldRating;


    name.userNotes =
        previousAction.oldNotes;


    currentIndex =
        previousAction.index;


    saveProgress();


    displayCurrentName();


    previousAction = null;

}

function skipName() {


    console.log(
        "Skipped:",
        shuffledNames[currentIndex].name
    );


    moveToNextName();

	saveProgress();
	updateProgress();

}

function showFinishedScreen() {

    showScreen("finished");

}



/* ==================================
   Move Forward
   ================================== */


function moveToNextName() {


    currentIndex++;


	if (currentIndex >= shuffledNames.length) {


		console.log(
			"All names rated!"
		);


		saveProgress();


		showFinishedScreen();


		return;

	}


    saveProgress();


	setTimeout(() => {
    	displayCurrentName();
	}, 150);


}



/* ==================================
   Reset UI
   ================================== */


function clearRatingState() {


    selectedRating = null;


    document
        .getElementById("user-notes")
        .value = "";


}



/* ==================================
   Start When App Loads
   ================================== */


document.addEventListener(
    "DOMContentLoaded",
    initializeRatings
);

document
    .getElementById("restart-btn")
    .addEventListener(
        "click",
        async () => {

            const newOrder =
                shuffleArray(
                    [...sampleNames]
                );


            shuffledNames =
                newOrder;


            currentIndex = 0;



            await database
                .ref(
                    "users/" + appState.currentUser
                )
                .set({

                    currentIndex: 0,

                    order:
                        shuffledNames.map(
                            name => name.name
                        ),

                    ratings: {}

                });



            displayCurrentName();


            showScreen("rating");

        }
    );
window.undoRating = undoRating;
