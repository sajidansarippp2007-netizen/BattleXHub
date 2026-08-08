import {
database,
ref,
set,
push,
onValue,
remove,
update,
get
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
console.log("adminTournament.js Loaded");

// ==========================
// EDIT MODE
// ==========================

let editTournamentId = null;

// ==========================
// INPUTS
// ==========================

const title = document.getElementById("title");
const entry = document.getElementById("entry");
const prize = document.getElementById("prize");
const slots = document.getElementById("slots");
const matchTime = document.getElementById("matchTime");

const roomId = document.getElementById("roomId");
const roomPassword = document.getElementById("roomPassword");

const banner = document.getElementById("banner");

const category = document.getElementById("category");

const map = document.getElementById("map");
const mode = document.getElementById("mode");
const perKill = document.getElementById("perKill");

const roomOpenTime =
document.getElementById("roomOpenTime");

const rules =
document.getElementById("rules");

const resultNote =
document.getElementById("resultNote");

const createBtn =
document.getElementById("createBtn");

const tournamentList =
document.getElementById("tournamentList");

// ==========================
// CATEGORY
// ==========================

category.innerHTML = `
<option value="all">🔥 ALL</option>
<option value="br">🏆 BR</option>
<option value="cs">⚔️ CS</option>
<option value="lonewolf">🐺 LONE WOLF</option>
`;
createBtn.onclick = async () => {

    if (
        title.value === "" ||
        entry.value === "" ||
        prize.value === "" ||
        slots.value === ""
    ) {
        alert("Sab fields bharo");
        return;
    }

    const data = {

        title: title.value,
        entry: Number(entry.value),
        prize: Number(prize.value),
        slots: Number(slots.value),

        roomId: roomId.value,
        roomPassword: roomPassword.value,

        matchTime: matchTime.value,
        startTime: new Date(matchTime.value).getTime(),

        banner: banner.value,

        categoryId: category.value,
        categoryName: category.options[category.selectedIndex].text,
        category: category.value,

        map: map.value,
        mode: mode.value,

        perKill: Number(perKill.value),

        roomOpenTime: Number(roomOpenTime.value),

        rules: rules.value,
        resultNote: resultNote.value

    };

    // =====================
    // UPDATE
    // =====================

    if (editTournamentId) {

        await update(
            ref(database, "tournaments/" + editTournamentId),
            data
        );

        alert("Tournament Updated ✅");

    } else {

        const id = push(ref(database, "tournaments")).key;

        await set(
            ref(database, "tournaments/" + id),
            {
                ...data,

                joinedPlayers: 0,
                joinedList: {},

                roomVisible: false,

                status: "upcoming"
            }
        );

        alert("Tournament Created ✅");
    }

    editTournamentId = null;

    createBtn.innerText = "Create Tournament";

    title.value = "";
    entry.value = "";
    prize.value = "";
    slots.value = "";
    matchTime.value = "";
    roomId.value = "";
    roomPassword.value = "";
    banner.value = "";
    category.value = "all";
    map.value = "";
    mode.value = "";
    perKill.value = "";
    roomOpenTime.value = "";
    rules.value = "";
    resultNote.value = "";

};
onValue(ref(database, "tournaments"), (snapshot) => {

    tournamentList.innerHTML = "";

    if (!snapshot.exists()) return;

    snapshot.forEach((child) => {

        const id = child.key;
        const t = child.val();

        tournamentList.innerHTML += `

<div class="tournamentCard">

<h3>${t.title}</h3>

<p>💰 Entry : ${t.entry}</p>

<p>🏆 Prize : ${t.prize}</p>

<p>👥 ${t.joinedPlayers || 0}/${t.slots}</p>

<p>🆔 Room : ${t.roomId || "Not Set"}</p>

<p>🔑 Password : ${t.roomPassword || "Not Set"}</p>

<p>📍 Status : ${t.status || "upcoming"}</p>

<button class="viewBtn"
onclick="editTournament('${id}')">
✏️ Edit
</button>

<button class="viewBtn"
onclick="viewPlayers('${id}')">
👥 View Players
</button>

<button class="viewBtn"
onclick="declareResult('${id}')">
🏆 Result
</button>

<button class="viewBtn"
onclick="startMatch('${id}')">
🟢 Start Match
</button>

<button class="viewBtn"
onclick="completeMatch('${id}')">
🔴 Complete Match
</button>

<button class="deleteBtn"
onclick="deleteTournament('${id}')">
🗑 Delete
</button>

</div>

`;

    });

});
// ==========================
// EDIT TOURNAMENT
// ==========================

window.editTournament = async (id) => {

    const snap = await get(ref(database, "tournaments/" + id));

    if (!snap.exists()) return;

    const t = snap.val();

    editTournamentId = id;

    title.value = t.title || "";
    entry.value = t.entry || "";
    prize.value = t.prize || "";
    slots.value = t.slots || "";

    matchTime.value = t.matchTime || "";

    roomId.value = t.roomId || "";
    roomPassword.value = t.roomPassword || "";

    banner.value = t.banner || "";

    category.value = t.category || "all";

    map.value = t.map || "";
    mode.value = t.mode || "";

    perKill.value = t.perKill || "";

    roomOpenTime.value = t.roomOpenTime || "";

    rules.value = t.rules || "";

    resultNote.value = t.resultNote || "";

    createBtn.innerText = "Update Tournament";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};

// ==========================
// DELETE TOURNAMENT
// ==========================

window.deleteTournament = async (id) => {

    if (!confirm("Tournament Delete Karna Hai?")) return;

    await remove(ref(database, "tournaments/" + id));

    alert("Tournament Deleted ✅");

};

// ==========================
// VIEW PLAYERS
// ==========================

window.viewPlayers = (id) => {

    location.href = "adminPlayers.html?id=" + id;

};

// ==========================
// RESULT PAGE
// ==========================

window.declareResult = (id) => {

    location.href = "adminResult.html?id=" + id;

};

// ==========================
// START MATCH
// ==========================

window.startMatch = async (id) => {

    await update(ref(database, "tournaments/" + id), {
        status: "live"
    });

    alert("Match Started ✅");

};

// ==========================
// COMPLETE MATCH
// ==========================

window.completeMatch = async (id) => {

    await update(ref(database, "tournaments/" + id), {
        status: "completed"
    });

    alert("Match Completed ✅");

};

console.log("✅ Tournament Manager Ready");