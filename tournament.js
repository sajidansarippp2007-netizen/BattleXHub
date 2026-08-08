import "./appCheck.js";

import {
    auth,
    database,
    ref,
    onValue,
    onAuthStateChanged,
    get
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const coinText = document.getElementById("coinText");
const container = document.getElementById("tournamentContainer");

let currentCategory = "all";

onAuthStateChanged(auth, (user) => {

    if (!user) {
        location.href = "login.html";
        return;
    }

    loadUser(user);
    loadTournament(user);

});

function loadUser(user) {

    onValue(ref(database, "users/" + user.uid), (snap) => {

        if (!snap.exists()) return;

        const data = snap.val();

        coinText.innerText = data.coins || 0;

    });

}

function loadTournament(user) {

    onValue(ref(database, "tournaments"), (snapshot) => {

        container.innerHTML = "";

        if (!snapshot.exists()) {

            container.innerHTML = `
            <h2 style="text-align:center;margin-top:40px;">
            No Tournament Available
            </h2>
            `;

            return;

        }

        snapshot.forEach((child) => {

            const id = child.key;
            const t = child.val();

if (t.status === "completed") {
    return;
}

            if (
                currentCategory !== "all" &&
                t.category !== currentCategory
            ) {
                return;
            }

            const joined = t.joinedPlayers || 0;
            const slots = t.slots || 0;

            const left = slots - joined;

            const percent =
                slots == 0 ? 0 : (joined / slots) * 100;

            let status = "🟡 Upcoming";

            if (t.status == "live") status = "🟢 Live";
            if (t.status == "completed") status = "🔴 Completed";

            let btn = "Join";
            let disable = "";

            if (t.joinedList && t.joinedList[user.uid]) {

                btn = "View Tournament";

            } else if (joined >= slots) {

                btn = "Full";
                disable = "disabled";

            }

            container.innerHTML += `

<div class="tournamentCard">

<img src="${t.banner}" class="tournamentBanner">

<div class="cardBody">

<div class="statusBadge">${status}</div>

<h2 class="tournamentTitle">${t.title}</h2>

<p class="matchTime">
🕒 ${t.matchTime || "-"}
</p>

<div class="infoGrid">

<div class="infoItem">
<span>🏆 Prize Pool</span>
<h3>${t.prize}</h3>
</div>

<div class="infoItem">
<span>💥 Per Kill</span>
<h3>${t.perKill || 0}</h3>
</div>

<div class="infoItem">
<span>💰 Entry Fee</span>
<h3>${t.entry}</h3>
</div>

</div>

<div class="infoGrid">

<div class="infoItem">
<span>🎮 Type</span>
<h3>${t.type || t.mode || "Battle Royal"}</h3>
</div>

<div class="infoItem">
<span>👤 Entry / Player</span>
<h3>${t.entry}</h3>
</div>

<div class="infoItem">
<span>🗺️ Map</span>
<h3>${t.map || "-"}</h3>
</div>

</div>

<div class="progressBox">

<div class="progress">
<div class="progressFill" style="width:${percent}%"></div>
</div>

<div class="progressText">
<span>Only ${left} Spot Left</span>
<span>${joined}/${slots}</span>
</div>

</div>

<button
${disable}
class="joinBtn"
onclick="openTournament('${id}')">
${btn}
</button>

</div>

</div>

`;

        });

    });

}
// =========================
// Open Tournament
// =========================

window.openTournament = async (id) => {

    const user = auth.currentUser;

    if (!user) {
        location.href = "login.html";
        return;
    }

    const tournamentSnap = await get(ref(database, "tournaments/" + id));

    if (!tournamentSnap.exists()) {
        alert("Tournament Not Found");
        return;
    }

    const tournament = tournamentSnap.val();

    // Already Joined
    if (tournament.joinedList && tournament.joinedList[user.uid]) {
        location.href = "joinedTournament.html?id=" + id;
        return;
    }

    // Tournament Full
    if ((tournament.joinedPlayers || 0) >= (tournament.slots || 0)) {
        alert("Tournament Full");
        return;
    }

    // User Data
    const userSnap = await get(ref(database, "users/" + user.uid));

    if (!userSnap.exists()) {
        alert("User Data Not Found");
        return;
    }

    const userData = userSnap.val();

    // Coins Check
    if ((userData.coins || 0) < Number(tournament.entry)) {
    return;
}

    // Open Same Join Page
    location.href = "joinTournament.html?id=" + id;

};

// =========================
// Category Filter
// =========================

const categoryButtons = document.querySelectorAll(".cat");

categoryButtons.forEach((btn) => {

    btn.onclick = () => {

        categoryButtons.forEach((b) =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        const text = btn.innerText.toLowerCase();

        if (text.includes("all")) {

            currentCategory = "all";

        } else if (text.includes("br")) {

            currentCategory = "br";

        } else if (text.includes("cs")) {

            currentCategory = "cs";

        } else if (text.includes("lone")) {

            currentCategory = "lonewolf";

        }

        loadTournament(auth.currentUser);

    };

});