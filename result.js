import {
    database,
    ref,
    onValue,
    get
} from "./firebase.js";

const resultList = document.getElementById("resultList");
const winnerCard = document.getElementById("winnerCard");
const matchInfo = document.getElementById("matchInfo");

onValue(ref(database, "tournaments"), async (snapshot) => {

    resultList.innerHTML = "";
    winnerCard.innerHTML = "";
    matchInfo.innerHTML = "";

    if (!snapshot.exists()) {

        resultList.innerHTML = `
        <div class="empty">
            No Tournament Result Found
        </div>`;
        return;

    }

    let completed = [];

    snapshot.forEach(child => {

        const t = child.val();

        if (t.status === "completed") {

            completed.push({
                id: child.key,
                ...t
            });

        }

    });

    if (completed.length === 0) {

        resultList.innerHTML = `
        <div class="empty">
            No Completed Tournament
        </div>`;
        return;

    }

    completed.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

    const t = completed[0];

    let winnerName = "Unknown";

    if (t.winnerName) {

        winnerName = t.winnerName;

    } else if (t.winner) {

        const userSnap = await get(ref(database, "users/" + t.winner));

        if (userSnap.exists()) {

            const user = userSnap.val();

            winnerName = user.gameName || user.name || "Unknown";

        }

    }

    winnerCard.innerHTML = `
    <div class="winnerCard">

        <h2>🏆 Champion</h2>

        <h3>${winnerName}</h3>

        <p>${t.title}</p>

    </div>`;

    matchInfo.innerHTML = `

    <div class="infoRow">
        <span>🎁 Prize</span>
        <span>${t.prize}</span>
    </div>

    <div class="infoRow">
        <span>👥 Players</span>
        <span>${t.joinedPlayers}/${t.slots}</span>
    </div>

    <div class="infoRow">
        <span>🎮 Mode</span>
        <span>${t.mode || "BR"}</span>
    </div>

    <div class="infoRow">
        <span>🗺 Map</span>
        <span>${t.map || "Bermuda"}</span>
    </div>

    <div class="infoRow">
        <span>📅 Match</span>
        <span>${t.matchTime || "Completed"}</span>
    </div>

    `;

    completed.forEach(async (tour, index) => {

        let name = "Unknown";

        if (tour.winnerName) {

            name = tour.winnerName;

        } else if (tour.winner) {

            const userSnap = await get(ref(database, "users/" + tour.winner));

            if (userSnap.exists()) {

                const user = userSnap.val();

                name = user.gameName || user.name || "Unknown";

            }

        }

        resultList.innerHTML += `

        <div class="resultCard">

            <div class="rank">
                ${index + 1}
            </div>

            <div class="playerInfo">

                <h3>${tour.title}</h3>

                <p>🏆 ${name}</p>

            </div>

            <div class="prize">

                ${tour.prize}

            </div>

        </div>

        `;

    });

});