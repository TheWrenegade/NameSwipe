let user1Names = [];
let user2Names = [];
let namesPool = [];
let filteredPool = [];
let currentIndex = 0;
let swipingUser = 'User 1';
let user1Likes = new Set();
let user2Likes = new Set();

// --- Start Swiping ---
document.getElementById("start-btn").addEventListener("click", () => {
    const file1 = document.getElementById("user1file").files[0];
    const file2 = document.getElementById("user2file").files[0];
    if (!file1 || !file2) {
        alert("Please upload both files!");
        return;
    }

    Papa.parse(file1, { header: true, complete: function(results) {
        user1Names = results.data;
        checkStart();
    }});
    Papa.parse(file2, { header: true, complete: function(results) {
        user2Names = results.data;
        checkStart();
    }});
});

// --- Shuffle function ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Check both files loaded ---
function checkStart() {
    if (user1Names.length && user2Names.length) {
        namesPool = [...new Set([...user1Names, ...user2Names])];
        shuffle(namesPool);
        document.getElementById("upload-section").style.display = "none";
        document.getElementById("filter-section").style.display = "block";
        document.getElementById("swipe-section").style.display = "block";
        applyFilter(); // Start with filter applied
    }
}

// --- Gender filter ---
document.getElementById("gender-filter").addEventListener("change", applyFilter);

function applyFilter() {
    const filter = document.getElementById("gender-filter").value;
    if (filter === "all") {
        filteredPool = [...namesPool];
    } else {
        filteredPool = namesPool.filter(n => n.Gender === filter);
    }
    currentIndex = 0;
    showCard();
}

// --- Nickname toggle ---
document.getElementById("show-nicknames").addEventListener("change", () => {
    showCard();
});

// --- Show current card ---
function showCard() {
    if (filteredPool.length === 0) {
        document.getElementById("name").textContent = "";
        document.getElementById("gender").textContent = "";
        document.getElementById("nicknames").textContent = "";
        document.getElementById("turn").textContent = "";
        alert("No names match this filter!");
        return;
    }

    if (currentIndex >= filteredPool.length) {
        if (swipingUser === 'User 1') {
            swipingUser = 'User 2';
            currentIndex = 0;
            alert("Switching to User 2!");
            applyFilter();
        } else {
            showMatches();
        }
        return;
    }

    const current = filteredPool[currentIndex];
    document.getElementById("name").textContent = current.Name || "";
    document.getElementById("gender").textContent = current.Gender ? `Gender: ${current.Gender}` : "";

    const showNicknames = document.getElementById("show-nicknames").checked;
    document.getElementById("nicknames").textContent = (current.Nicknames && showNicknames) ? `Nicknames: ${current.Nicknames}` : "";

    document.getElementById("turn").textContent = `${swipingUser}'s turn`;
}

// --- Swiping function ---
function swipe(liked) {
    const current = filteredPool[currentIndex];
    if (liked) {
        if (swipingUser === 'User 1') user1Likes.add(current.Name);
        else user2Likes.add(current.Name);
    }
    currentIndex++;
    showCard();
}

// --- Buttons ---
document.getElementById("like-btn").addEventListener("click", () => swipe(true));
document.getElementById("dislike-btn").addEventListener("click", () => swipe(false));

// --- Show matches at the end ---
function showMatches() {
    document.getElementById("swipe-section").style.display = "none";
    document.getElementById("matches-section").style.display = "block";
    const matches = [...user1Likes].filter(name => user2Likes.has(name));
    const list = document.getElementById("matches-list");
    list.innerHTML = "";
    if (matches.length === 0) list.innerHTML = "<li>No matches 😢</li>";
    else matches.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        list.appendChild(li);
    });
}

// --- Drag/Swipe Animations ---
let isDragging = false;
let startX = 0;
const card = document.getElementById("card");

card.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX;
    card.classList.add("dragging");
});

card.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX/10}deg)`;
});

card.addEventListener("mouseup", e => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove("dragging");
    const deltaX = e.clientX - startX;

    if (deltaX > 100) {
        swipe(true);
        animateCard("right");
    } else if (deltaX < -100) {
        swipe(false);
        animateCard("left");
    } else {
        card.style.transform = "translateX(0px) rotate(0deg)";
    }
});

card.addEventListener("mouseleave", e => {
    if (isDragging) {
        isDragging = false;
        card.classList.remove("dragging");
        card.style.transform = "translateX(0px) rotate(0deg)";
    }
});

// Touch support
card.addEventListener("touchstart", e => {
    isDragging = true;
    startX = e.touches[0].clientX;
});
card.addEventListener("touchmove", e => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX/10}deg)`;
});
card.addEventListener("touchend", e => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = e.changedTouches[0].clientX - startX;

    if (deltaX > 100) {
        swipe(true);
        animateCard("right");
    } else if (deltaX < -100) {
        swipe(false);
        animateCard("left");
    } else {
        card.style.transform = "translateX(0px) rotate(0deg)";
    }
});

// --- Animate card off-screen ---
function animateCard(direction) {
    const distance = direction === "right" ? 1000 : -1000;
    card.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    card.style.transform = `translateX(${distance}px) rotate(${distance/10}deg)`;
    card.style.opacity = "0";

    setTimeout(() => {
        card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        card.style.transform = "translateX(0px) rotate(0deg)";
        card.style.opacity = "1";
        showCard();
    }, 500);
}
