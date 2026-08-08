import {
    auth,
    database,
    ref,
    onValue
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const tournamentList = document.getElementById("tournamentList");
const categoryTitle = document.getElementById("categoryTitle");

const params = new URLSearchParams(location.search);
const categoryId = params.get("id");

onValue(ref(database, "categories/" + categoryId), (snapshot) => {

    if (snapshot.exists()) {

        categoryTitle.innerHTML = snapshot.val().name;

    }

});

onValue(ref(database, "tournaments"), (snapshot) => {

    tournamentList.innerHTML = "";

    if (!snapshot.exists()) return;

    snapshot.forEach((child) => {

        const data = child.val();
const joined =
data.joinedList &&
data.joinedList[auth.currentUser.uid];
        if (data.categoryId != categoryId) return;

        tournamentList.innerHTML += `
        <div class="card">

<img src="${data.banner}" class="bannerImage">

<h3>${data.title}</h3>

<p>🏆 Prize : ${data.prize} Coins</p>

<p>💰 Entry : ${data.entry} Coins</p>

<p>💥 Per Kill : ${data.perKill || 0} Coins</p>

<p>🗺️ Map : ${data.map || "Classic"}</p>
<p>🎮 Mode : ${data.mode || "-"}</p>

<p>⏰ Match : ${data.matchTime || "-"}</p>
<p>👥 ${data.joinedPlayers}/${data.slots}</p>

${joined
? `
<button class="joinBtn"
onclick="location.href='joinedTournament.html?id=${child.key}'">
👁 View Tournament
</button>
`
: `
<button class="joinBtn"
onclick="location.href='joinTournament.html?id=${child.key}'">
Join Now
</button>
`}

</div>
        `;

    });

});