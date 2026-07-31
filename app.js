/* ==================================
   Baby Name Picker - App Controller
   ================================== */


/*
    Global App State

    Later this will be populated
    from Google Sheets.
*/

const appState = {

    currentUser: null,

    currentScreen: "loading",

    selectedRating: null,

    currentName: null,

    names: []

};



/* ==================================
   DOM References
   ================================== */


const screens = {

    loading: document.getElementById("loading-screen"),

    login: document.getElementById("login-screen"),

    rating: document.getElementById("rating-screen"),
	
	finished: document.getElementById("finished-screen"),

    browse: document.getElementById("browse-screen"),

    results: document.getElementById("results-screen")

};


const sideMenu =
    document.getElementById("side-menu");


const menuButton =
    document.getElementById("menu-button");


const currentUserDisplay =
    document.getElementById("current-user-display");


const userButtons =
    document.querySelectorAll(".user-btn");



/* ==================================
   Initialize App
   ================================== */


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {


    console.log(
        "Baby Name Picker loaded."
    );


    setupUserSelection();

    setupNavigation();

    setupKeyboardShortcuts();


    /*
        Temporary behavior:

        Pretend loading is complete.
        Later this will wait for
        Google Sheet data.
    */

    setTimeout(() => {

        showScreen("login");

    }, 1000);


}



/* ==================================
   Screen Management
   ================================== */


function showScreen(screenName) {


    Object.values(screens)
        .forEach(screen => {

            screen.classList.add("hidden");

        });


    if (screens[screenName]) {

        screens[screenName]
            .classList.remove("hidden");

    }


    appState.currentScreen =
        screenName;

}



/* ==================================
   User Selection
   ================================== */


function setupUserSelection() {


    userButtons.forEach(button => {


        button.addEventListener(
            "click",
            () => {


                const user =
                    button.dataset.user;


                selectUser(user);


            }
        );


    });


}



function selectUser(user) {


    appState.currentUser =
        user;


    console.log(
        "Current user:",
        user
    );


    if (currentUserDisplay) {

        const displayName =
            user.charAt(0).toUpperCase()
            + user.slice(1);


		currentUserDisplay.textContent =
			"Rating as " + displayName;

    }


    showScreen("rating");


}



/* ==================================
   Navigation
   ================================== */


function setupNavigation() {


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            toggleMenu
        );

    }


    document
        .querySelectorAll(".back-button")
        .forEach(button => {


            button.addEventListener(
                "click",
                () => {

                    showScreen("rating");

                }
            );


        });


}



function toggleMenu() {


    sideMenu.classList.toggle(
        "hidden"
    );


}



/* ==================================
   Keyboard Shortcuts
   ================================== */


function setupKeyboardShortcuts() {


    document.addEventListener(
        "keydown",
        handleKeyboard
    );


}



function handleKeyboard(event) {


    const notes =
        document.getElementById(
            "user-notes"
        );


    /*
        Ignore shortcuts while typing.

        Except:
        Escape = leave notes
        Ctrl/Cmd + Enter = submit
    */


    if (
        document.activeElement === notes
    ) {


        if (
            event.key === "Escape"
        ) {

            notes.blur();

        }


        return;

    }



    switch (
        event.key.toLowerCase()
    ) {


        case "n":

            notes.focus();

            break;


        case "s":

            skipName();

            break;


        case "1":

            rateName("love");

            break;


        case "2":

            rateName("like");

            break;


        case "3":

            rateName("maybe");

            break;


        case "4":

            rateName("pass");

            break;


    }


}



/* ==================================
   Temporary Placeholders

   These will be replaced by
   rating.js later.
   ================================== */


function rateName(rating) {


    console.log(
        "Rating selected:",
        rating
    );


    appState.selectedRating =
        rating;


}



function skipName() {


    console.log(
        "Skipping name"
    );


}



/* ==================================
   Make State Available Globally

   Other JS files can access it.
   ================================== */


window.appState = appState;
window.showScreen = showScreen;
window.rateName = rateName;
window.skipName = skipName;