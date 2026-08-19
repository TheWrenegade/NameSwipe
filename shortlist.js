/* ==================================
   Shortlist Rating State
   ================================== */

let shortlistCurrentIndex = 0;
let shortlistNames = [];
let shortlistSelectedRating = null;


/* ==================================
   Firebase
   ================================== */

function getShortlistRatings() {

    const ratings = {};

    shortlistNames.forEach(name => {

        ratings[name.name] = {
            rating: name.userRating ?? null,
            notes: name.userNotes || ""
        };

    });

    return ratings;
}


function saveShortlistProgress() {

    const progress = {

        currentIndex:
            shortlistCurrentIndex,

        order:
            shortlistNames.map(
                name => name.name
            ),

        ratings:
            getShortlistRatings()

    };

    console.log(
        "Saving shortlist:",
        progress
    );

    return database
        .ref(
            "users/" +
            appState.currentUser +
            "/shortlist"
        )
        .set(progress);

}


/* ==================================
   Load Shortlist
   ================================== */

async function loadShortlist() {

    const loadedNames =
        await loadShortlistNamesFromSheet();

    shortlistNames = loadedNames;

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

    if (!progress) {

        shortlistNames =
            shuffleArray(
                [...loadedNames]
            );

        shortlistCurrentIndex = 0;

        await saveShortlistProgress();

        return;

    }


    /*
       Restore saved order
    */

    shortlistNames =
        progress.order
            .map(savedName =>
                loadedNames.find(
                    name =>
                        name.name === savedName
                )
            )
            .filter(Boolean);


    /*
       Restore ratings
    */

    Object.keys(
        progress.ratings || {}
    ).forEach(nameKey => {

        const saved =
            progress.ratings[nameKey];

        const name =
            shortlistNames.find(
                name =>
                    name.name === nameKey
            );

        if (name) {

            name.userRating =
                saved.rating;

            name.userNotes =
                saved.notes || "";

        }

    });


    /*
       Find next unrated name
    */

    shortlistCurrentIndex =
        shortlistNames.findIndex(
            name => !name.userRating
        );


    if (shortlistCurrentIndex === -1) {
        shortlistCurrentIndex = 0;
    }

}


/* ==================================
   Display Shortlist Name
   ================================== */

function displayShortlistName() {

    const name =
        shortlistNames[
            shortlistCurrentIndex
        ];

    if (!name) {
        showScreen("shortlist-finished");
        return;
    }


    document.getElementById(
        "shortlist-name"
    ).textContent =
        name.name;


    document.getElementById(
        "shortlist-sex-pill"
    ).textContent =
        name.sex;


    document.getElementById(
        "shortlist-origin"
    ).textContent =
        name.origin;


    document.getElementById(
        "shortlist-ranking"
    ).textContent =
        "#" + name.ranking;


    document.getElementById(
        "shortlist-syllables"
    ).textContent =
        name.syllables;


    document.getElementById(
        "shortlist-nicknames"
    ).textContent =
        name.nicknames;


    document.getElementById(
        "shortlist-reference"
    ).textContent =
        name.reference;


    document.getElementById(
        "shortlist-acquaintance"
    ).textContent =
        name.acquaintance;


    document.getElementById(
        "shortlist-notes"
    ).value =
        name.userNotes || "";


    restoreShortlistRatingButtons(
        name.userRating
    );

    updateShortlistProgress();

}


/* ==================================
   Restore Buttons
   ================================== */

function restoreShortlistRatingButtons(rating) {

    document
        .querySelectorAll(
            ".shortlist-rating[data-rating]"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.rating === rating
            );

        });

}


/* ==================================
   Rate Name
   ================================== */

function rateShortlistName(rating) {

    const name =
        shortlistNames[
            shortlistCurrentIndex
        ];

    if (!name) return;

    name.userRating =
        rating;

    name.userNotes =
        document.getElementById(
            "shortlist-notes"
        ).value;

    shortlistSelectedRating =
        rating;

    saveShortlistProgress();

    updateShortlistProgress();

    moveToNextShortlistName();

}


/* ==================================
   Move Forward
   ================================== */

function moveToNextShortlistName() {

    shortlistCurrentIndex++;

    if (
        shortlistCurrentIndex >=
        shortlistNames.length
    ) {

        saveShortlistProgress();

        showScreen(
            "shortlist-finished"
        );

        return;

    }

    saveShortlistProgress();

    displayShortlistName();

}


/* ==================================
   Progress
   ================================== */

function updateShortlistProgress() {

    const total =
        shortlistNames.length;

    const rated =
        shortlistNames.filter(
            name => name.userRating
        ).length;

    document.getElementById(
        "shortlist-progress-count"
    ).textContent =
        `${rated} / ${total} Rated`;


    const percent =
        total === 0
            ? 0
            : Math.round(
                (rated / total) * 100
            );

    document.getElementById(
        "shortlist-progress-percent"
    ).textContent =
        `${percent}%`;


    document.getElementById(
        "shortlist-progress-fill"
    ).style.width =
        `${percent}%`;

}


/* ==================================
   Initialize
   ================================== */

async function initializeShortlist() {

    await loadShortlist();

    displayShortlistName();

}