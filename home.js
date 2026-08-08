import "./appCheck.js";

import {
    auth,
    database,
    signOut,
    onAuthStateChanged,
    ref,
    get,
    onValue,
    update,
    messaging,
    getToken,
    onMessage
} from "./firebase.js";

import {
    showSuccess,
    showError,
    showConfirm
} from "./popup.js";


/* =========================
DOM
========================= */

const username = document.getElementById("username");
const coins = document.getElementById("coins");
const logoutBtn = document.getElementById("logoutBtn");
const notificationCount =
    document.getElementById("notificationCount");

const menuName =
    document.getElementById("menuName");

const menuCoins =
    document.getElementById("menuCoins");

const menuPhoto =
    document.getElementById("menuPhoto");

const noticeText =
    document.getElementById("noticeText");

const sliderTrack =
    document.getElementById("sliderTrack");

const sliderDots =
    document.getElementById("sliderDots");

const moreDetails =
    document.getElementById("moreDetails");

const bannerSection =
    document.getElementById("bannerSection");

const categoryList =
    document.getElementById("categoryList");

const tournamentContainer =
    document.getElementById("tournamentContainer");

const joinedMatches =
    document.getElementById("joinedMatches");

const menuBtn =
    document.getElementById("menuBtn");

const sideMenu =
    document.getElementById("sideMenu");

const overlay =
    document.getElementById("overlay");


/* =========================
GLOBAL
========================= */

let banners = [];
let currentBanner = 0;
let sliderTimer = null;
let startX = 0;

let selectedCategory = "all";
let selectedStatus = "all";

let currentUser = null;


/* =========================
FCM VAPID KEY
========================= */

const VAPID_KEY =
"BJAD2IoFkwFgg1geTor2EUlYC4POMb64rJw2DNKOtidpLf3SaET2Yj2NP3aOex4IXKFlMQSFkDXp3sAUnWBv68U";


/* =========================
PUSH NOTIFICATION SETUP
========================= */

async function setupPushNotification(user) {

    try {

        if (!("Notification" in window)) {

            console.log(
                "Notifications not supported"
            );

            return;

        }

        if (!("serviceWorker" in navigator)) {

            console.log(
                "Service Worker not supported"
            );

            return;

        }


        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );


        let permission =
            Notification.permission;


        if (permission === "default") {

            permission =
                await Notification.requestPermission();

        }


        if (permission !== "granted") {

            console.log(
                "Notification permission:",
                permission
            );

            return;

        }


        const token = await getToken(
            messaging,
            {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration:
                    registration
            }
        );


        if (!token) {

            console.log(
                "FCM token not received"
            );

            return;

        }


        console.log(
            "✅ FCM Token:",
            token
        );


        await update(
            ref(
                database,
                "users/" + user.uid
            ),
            {
                fcmToken: token
            }
        );


        console.log(
            "✅ FCM Token saved to Firebase"
        );


    } catch (error) {

        console.error(
            "❌ Push notification error:",
            error
        );

    }

}


/* =========================
FOREGROUND NOTIFICATION
========================= */

onMessage(
    messaging,
    (payload) => {

        console.log(
            "📩 Foreground notification:",
            payload
        );


        const title =
            payload.notification?.title ||
            "BattleXHub";


        const body =
            payload.notification?.body ||
            "You have a new notification.";


        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {

            new Notification(
                title,
                {
                    body: body,
                    icon: "/assets/logo.png"
                }
            );

        }

    }
);
/* =========================
LOGIN
========================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    try {

        const snap = await get(
            ref(database, "users/" + user.uid)
        );

        if (snap.exists()) {

            const data = snap.val();

            if (username) {
                username.textContent =
                    "Esports Tournament";
            }

            if (coins) {
                coins.textContent =
                    data.coins || 0;
            }

            if (menuName) {
                menuName.textContent =
                    user.email
                        ? user.email.split("@")[0]
                        : "Player";
            }

            if (menuCoins) {
                menuCoins.textContent =
                    "🪙 " + (data.coins || 0);
            }

            if (menuPhoto && data.photo) {
                menuPhoto.src = data.photo;
            }

        }


        /* Push Notification */

        setupPushNotification(user);


        loadTournaments();

        loadJoinedMatches(user);


    } catch (err) {

        console.error(
            "Home loading error:",
            err
        );

    }

});


/* =========================
ANNOUNCEMENT
========================= */

if (noticeText) {

    onValue(
        ref(database, "announcement"),
        (snapshot) => {

            noticeText.textContent =
                snapshot.exists()
                    ? snapshot.val()
                    : "📢 Welcome To BattleXHub";

        }
    );

}


/* =========================
NOTIFICATION COUNT
========================= */

if (notificationCount) {

    onValue(
        ref(database, "notifications"),
        (snapshot) => {

            let count = 0;

            if (snapshot.exists()) {

                const data = snapshot.val();

                Object.values(data).forEach(
                    notification => {

                        if (
                            notification.uid ===
                                currentUser?.uid ||
                            notification.uid ===
                                "all" ||
                            !notification.uid
                        ) {

                            count++;

                        }

                    }
                );

            }

            notificationCount.textContent =
                count;

        }
    );

}


/* =========================
LOGOUT
========================= */

if (logoutBtn) {

    logoutBtn.onclick = async () => {

        try {

            await signOut(auth);

            location.href =
                "login.html";

        } catch (error) {

            console.error(error);

        }

    };

}


/* =========================
RENDER BANNER
========================= */

function renderBanner() {

    if (!sliderTrack || !sliderDots) {
        return;
    }

    sliderTrack.innerHTML = "";
    sliderDots.innerHTML = "";

    banners.forEach(
        (banner, index) => {

            sliderTrack.innerHTML += `
                <div class="slide">

                    <img
                        src="${banner.image}"
                        data-link="${banner.link || ""}"
                        alt="Banner">

                </div>
            `;


            const dot =
                document.createElement("span");


            if (index === currentBanner) {

                dot.classList.add(
                    "active"
                );

            }


            dot.onclick = () => {

                currentBanner = index;

                updateBanner();

            };


            sliderDots.appendChild(dot);

        }
    );


    updateBanner();

    startBannerSlider();

}


/* =========================
UPDATE BANNER
========================= */

function updateBanner() {

    if (!sliderTrack) return;

    sliderTrack.style.transform =
        `translateX(-${currentBanner * 100}%)`;


    document
        .querySelectorAll(
            "#sliderDots span"
        )
        .forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentBanner
                );

            }
        );

}


/* =========================
AUTO SLIDER
========================= */

function startBannerSlider() {

    clearInterval(sliderTimer);

    sliderTimer =
        setInterval(() => {

            if (banners.length <= 1) {
                return;
            }

            currentBanner++;

            if (
                currentBanner >=
                banners.length
            ) {

                currentBanner = 0;

            }

            updateBanner();

        }, 3000);

}


/* =========================
BANNER CLICK
========================= */

sliderTrack?.addEventListener(
    "click",
    (e) => {

        if (
            e.target.tagName !==
            "IMG"
        ) {
            return;
        }

        const link =
            e.target.dataset.link;


        if (link) {

            window.open(
                link,
                "_blank"
            );

        }

    }
);


moreDetails?.addEventListener(
    "click",
    () => {

        if (!banners.length) {
            return;
        }

        const link =
            banners[currentBanner].link;


        if (link) {

            window.open(
                link,
                "_blank"
            );

        }

    }
);


/* =========================
SWIPE SUPPORT
========================= */

sliderTrack?.addEventListener(
    "touchstart",
    (e) => {

        startX =
            e.touches[0].clientX;

    }
);


sliderTrack?.addEventListener(
    "touchend",
    (e) => {

        if (!banners.length) {
            return;
        }

        const endX =
            e.changedTouches[0].clientX;


        if (
            startX - endX > 50
        ) {

            currentBanner++;

        }


        if (
            endX - startX > 50
        ) {

            currentBanner--;

        }


        if (currentBanner < 0) {

            currentBanner =
                banners.length - 1;

        }


        if (
            currentBanner >=
            banners.length
        ) {

            currentBanner = 0;

        }


        updateBanner();

    }
);
/* =========================
LOAD CATEGORIES
========================= */

if (categoryList) {

    onValue(
        ref(database, "categories"),
        (snapshot) => {

            categoryList.innerHTML = "";

            categoryList.innerHTML += `
                <div
                    class="categoryCard activeCategory"
                    onclick="filterTournament('all',this)"
                >
                    <img src="assets/logo.png">
                    <p>All</p>
                </div>
            `;


            if (!snapshot.exists()) {
                return;
            }


            snapshot.forEach((child) => {

                const data = child.val();


                categoryList.innerHTML += `
                    <div
                        class="categoryCard"
                        onclick="filterTournament('${child.key}',this)"
                    >

                        <img
                            src="${data.banner || 'assets/logo.png'}"
                        >

                        <p>
                            ${data.name || child.key}
                        </p>

                    </div>
                `;

            });

        }
    );

}


/* =========================
CATEGORY FILTER
========================= */

window.filterTournament =
    (category, element) => {

        selectedCategory = category;


        document
            .querySelectorAll(
                ".categoryCard"
            )
            .forEach(card => {

                card.classList.remove(
                    "activeCategory"
                );

            });


        if (element) {

            element.classList.add(
                "activeCategory"
            );

        }


        loadTournaments();

    };


/* =========================
JOINED MATCHES
========================= */

function loadJoinedMatches(user) {

    if (!joinedMatches) {
        return;
    }

    joinedMatches.innerHTML = "";

}


/* =========================
LOAD TOURNAMENTS
========================= */

function loadTournaments() {

    if (!tournamentContainer) {
        return;
    }


    get(
        ref(database, "tournaments")
    )

    .then((snapshot) => {

        tournamentContainer.innerHTML = "";


        if (!snapshot.exists()) {

            tournamentContainer.innerHTML = `
                <h3 style="text-align:center">
                    No Tournament Available
                </h3>
            `;

            return;

        }


        let tournaments = [];


        snapshot.forEach((child) => {

            tournaments.push({

                id: child.key,

                ...child.val()

            });

        });


        tournaments.sort(
            (a, b) =>
                (b.startTime || 0) -
                (a.startTime || 0)
        );


        tournaments.forEach(
            renderTournament
        );

    })

    .catch((error) => {

        console.error(
            "Tournament loading error:",
            error
        );

        tournamentContainer.innerHTML = `
            <h3 style="text-align:center">
                Unable to load tournaments
            </h3>
        `;

    });

}


/* =========================
RENDER TOURNAMENT
========================= */

function renderTournament(t) {

    if (
        selectedCategory !== "all" &&
        t.categoryId !== selectedCategory &&
        t.category !== selectedCategory
    ) {

        return;

    }


    if (
        selectedStatus === "live" &&
        t.status !== "live"
    ) {

        return;

    }


    if (
        selectedStatus === "upcoming" &&
        t.status !== "upcoming"
    ) {

        return;

    }


    if (
        selectedStatus === "completed" &&
        t.status !== "completed"
    ) {

        return;

    }


    let badge = "🟡 Upcoming";


    if (t.status === "live") {

        badge = "🟢 Live";

    }


    if (t.status === "completed") {

        badge = "🔴 Completed";

    }


    const joined =
        Number(t.joinedPlayers || 0);


    const slots =
        Number(t.slots || 0);


    const percent =
        slots > 0
            ? Math.min(
                (joined / slots) * 100,
                100
            )
            : 0;


    const left =
        Math.max(
            slots - joined,
            0
        );


    let buttonText =
        "Join Now";


    let buttonLink =
        `joinTournament.html?id=${t.id}`;


    if (t.status === "completed") {

        buttonText =
            "View Result";

        buttonLink =
            `result.html?id=${t.id}`;

    }


    if (
        auth.currentUser &&
        t.joinedList &&
        t.joinedList[
            auth.currentUser.uid
        ]
    ) {

        if (
            t.status ===
            "completed"
        ) {

            buttonText =
                "View Result";

            buttonLink =
                `result.html?id=${t.id}`;

        } else {

            buttonText =
                "Open";

            buttonLink =
                `joinedTournament.html?id=${t.id}`;

        }

    }


    const bannerImage =
        t.banner ||
        "assets/logo.png";


    tournamentContainer.innerHTML += `

        <div class="tournamentCard">

            <img
                src="${bannerImage}"
                class="tournamentBanner"
                alt="Tournament Banner"
            >

            <div class="cardBody">

                <div class="statusBadge">
                    ${badge}
                </div>


                <h2 class="tournamentTitle">
                    ${t.title || "Tournament"}
                </h2>


                <p class="matchTime">
                    📅 ${formatDate(t.startTime)}
                </p>


                <p class="matchTime">
                    ${getCountdown(t.startTime)}
                </p>


                <div class="infoGrid">

                    <div class="infoItem">
                        <span>🏆 Prize</span>
                        <h3>${t.prize || 0}</h3>
                    </div>


                    <div class="infoItem">
                        <span>💰 Entry</span>
                        <h3>${t.entry || 0}</h3>
                    </div>


                    <div class="infoItem">
                        <span>💥 Kill</span>
                        <h3>${t.perKill || 0}</h3>
                    </div>

                </div>


                <div class="infoGrid">

                    <div class="infoItem">
                        <span>🎮 Mode</span>
                        <h3>
                            ${t.mode || "BR"}
                        </h3>
                    </div>


                    <div class="infoItem">
                        <span>🗺 Map</span>
                        <h3>
                            ${t.map || "Bermuda"}
                        </h3>
                    </div>


                    <div class="infoItem">
                        <span>👥 Players</span>
                        <h3>
                            ${joined}/${slots}
                        </h3>
                    </div>

                </div>


                <div class="progressBox">

                    <div class="progress">

                        <div
                            class="progressFill"
                            style="width:${percent}%"
                        ></div>

                    </div>


                    <div class="progressText">

                        <span>
                            Only ${left} Spot Left
                        </span>

                        <span>
                            ${joined}/${slots}
                        </span>

                    </div>

                </div>


                <button
                    class="joinBtn"
                    onclick="location.href='${buttonLink}'"
                >
                    ${buttonText}
                </button>

            </div>

        </div>

    `;

}
/* =========================
FORMAT DATE
========================= */

function formatDate(time) {

    if (!time) {
        return "";
    }

    return new Date(
        Number(time)
    ).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================
COUNTDOWN
========================= */

function getCountdown(time) {

    if (!time) {
        return "";
    }

    const diff =
        Number(time) - Date.now();


    if (diff <= 0) {

        return "🟢 Match Started";

    }


    const h =
        Math.floor(
            diff / 3600000
        );


    const m =
        Math.floor(
            (diff % 3600000) / 60000
        );


    return `⏳ ${h}h ${m}m Left`;

}


/* =========================
STATUS TABS
========================= */

document
    .querySelectorAll(".matchTab")
    .forEach((tab) => {

        tab.addEventListener(
            "click",
            function () {

                selectedStatus =
                    this.dataset.status;


                document
                    .querySelectorAll(
                        ".matchTab"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                this.classList.add(
                    "active"
                );


                loadTournaments();

            }
        );

    });


/* =========================
SIDE MENU
========================= */

function toggleMenu() {

    if (!sideMenu || !overlay) {
        return;
    }


    sideMenu.classList.toggle(
        "show"
    );


    overlay.classList.toggle(
        "show"
    );

}


menuBtn?.addEventListener(
    "click",
    toggleMenu
);


overlay?.addEventListener(
    "click",
    () => {

        sideMenu?.classList.remove(
            "show"
        );

        overlay?.classList.remove(
            "show"
        );

    }
);


/* =========================
OPEN PROFILE
========================= */

window.openProfile = () => {

    location.href =
        "profile.html";

};


/* =========================
OPEN WALLET
========================= */

window.openWallet = () => {

    location.href =
        "wallet.html";

};


/* =========================
OPEN NOTIFICATION
========================= */

window.openNotification = () => {

    location.href =
        "notification.html";

};


/* =========================
MY TOURNAMENT
========================= */

window.showJoinedMatches = () => {

    location.href =
        "myTournament.html";

};


/* =========================
OPEN TOURNAMENT
========================= */

window.openTournament = (id) => {

    location.href =
        "joinedTournament.html?id=" +
        id;

};


/* =========================
AUTO REFRESH
========================= */

setInterval(() => {

    loadTournaments();

}, 10000);


/* =========================
INITIAL LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTournaments();

    }
);


/* =========================
FINAL
========================= */

console.log(
    "✅ BattleXHub Home V6 Loaded Successfully"
);