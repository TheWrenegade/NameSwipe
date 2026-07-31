/* ==================================
   Baby Name Picker - Rating Engine
   ================================== */

let sampleNames = [];



/* ==================================
   Rating State
   ================================== */


let currentIndex = 0;

let shuffledNames = [];

let selectedRating = null;

let previousAction = null;

/* ==================================
   Local Storage
   ================================== */

const STORAGE_KEY = "babyNameProgress";


function saveProgress() {

    let progress =
        JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || {};


    if (!progress.users) {

        progress.users = {};

    }


    if (!progress.users[appState.currentUser]) {

        progress.users[appState.currentUser] = {};

    }


    progress.users[appState.currentUser] = {

        currentIndex: currentIndex,

        order: shuffledNames.map(
            name => name.name
        ),

        ratings: {}

    };


    shuffledNames.forEach(name => {


        progress.users[
            appState.currentUser
        ].ratings[name.name] = {


            rating:
                name.userRating || null,


            notes:
                name.userNotes || ""


        };


    });


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
    );

}


function loadProgress() {


    const saved =
        localStorage.getItem(STORAGE_KEY);


    if (!saved) {

        return false;

    }


    const progress =
        JSON.parse(saved);


    const userProgress =
        progress.users?.[appState.currentUser];


    if (!userProgress) {

        return false;

    }


    shuffledNames =
        userProgress.order
            .map(savedName =>
                sampleNames.find(
                    name =>
                        name.name === savedName
                )
            )
            .filter(Boolean);



    shuffledNames.forEach(name => {


        const savedRating =
            userProgress.ratings[name.name];


        if (savedRating) {


            name.userRating =
                savedRating.rating;


            name.userNotes =
                savedRating.notes;


        }


    });



    currentIndex =
        userProgress.currentIndex || 0;



    return true;

}

function updateProgress() {


    const total =
        shuffledNames.length;


    const rated =
        shuffledNames.filter(
            name => name.userRating
        ).length;


    const percent =
        total === 0
        ? 0
        : Math.round(
            (rated / total) * 100
        );


    document.getElementById(
        "progress-count"
    ).textContent =
        `${rated} / ${total} Rated`;


    document.getElementById(
        "progress-percent"
    ).textContent =
        `${percent}%`;


    const fill =
        document.getElementById(
            "progress-fill"
        );


    if (fill) {

        fill.style.width =
            `${percent}%`;

    }

}

/* ==================================
   Initialize Rating System
   ================================== */


async function initializeRatings() {


    const resumed =
        loadProgress();


    if (!resumed) {


        const loadedNames =
			await loadNamesFromSheet();

		sampleNames =
			loadedNames;


		shuffledNames =
			shuffleArray([...sampleNames]);


        currentIndex =
            0;

    }


    appState.names =
        shuffledNames;


    displayCurrentName();

	updateProgress();

    setupRatingButtons();


    document
    .getElementById("user-notes")
    .addEventListener(
        "input",
        () => {


            const name =
                shuffledNames[currentIndex];


            if (!name) {

                return;

            }


            name.userNotes =
                document.getElementById(
                    "user-notes"
                ).value;


            saveProgress();


        }
    );


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
		showScreen("login");
	}, 1000);


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
        () => {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );


            if (
                saved &&
                saved.users &&
                appState.currentUser
            ) {

                // Clear only current user's ratings
                saved.users[
                    appState.currentUser
                ] = {

                    currentIndex: 0,

                    order: shuffleArray(
                        [...sampleNames]
                    ).map(
                        name => name.name
                    ),

                    ratings: {}

                };


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(saved)
                );

            }


            // Restart local state

            shuffledNames =
                shuffleArray(
                    [...sampleNames]
                );


            currentIndex = 0;


            displayCurrentName();


            showScreen("rating");


        }
    );
