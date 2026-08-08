import {
  auth,
  database,
  ref,
  get,
  update,
  onAuthStateChanged,
  push,
  set
} from "./firebase.js";

import {
  showSuccess,
  showError
} from "./popup.js";

const banner = document.getElementById("banner");
const title = document.getElementById("title");
const entry = document.getElementById("entry");

const joinBtn = document.getElementById("joinBtn");
const ign = document.getElementById("ign");
const uid = document.getElementById("uid");
const mobile = document.getElementById("mobile");

const params = new URLSearchParams(window.location.search);
const tournamentId = params.get("id");

if (!tournamentId) {
    alert("Tournament ID Missing");
    history.back();
}

// Tournament Load
async function loadTournament() {

    try {

        const snap = await get(ref(database, "tournaments/" + tournamentId));

        if (!snap.exists()) {
            alert("Tournament Not Found");
            return;
        }

        const t = snap.val();

        banner.src = t.banner || "";
        title.innerText = t.title || "";
        entry.innerText = "💰 Entry : " + (t.entry || 0) + " Coins";

    } catch (e) {

        console.log(e);
        alert("Tournament Load Failed");

    }

}

loadTournament();

// Join Button
joinBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
        alert("Please Login First");
        location.href = "login.html";
        return;
    }

    if (ign.value.trim() === "") {
        alert("Enter IGN");
        ign.focus();
        return;
    }

    if (uid.value.trim() === "") {
        alert("Enter UID");
        uid.focus();
        return;
    }

    joinBtn.disabled = true;
    joinBtn.innerText = "Joining...";

    try {

        const userRef = ref(database, "users/" + user.uid);
        const tournamentRef = ref(database, "tournaments/" + tournamentId);

        const userSnap = await get(userRef);
        const tournamentSnap = await get(tournamentRef);

        if (!userSnap.exists()) {
            throw new Error("User Data Missing");
        }

        if (!tournamentSnap.exists()) {
            throw new Error("Tournament Missing");
        }

        const userData = userSnap.val();
        const tournament = tournamentSnap.val();

        // Already Joined
        if (tournament.joinedList &&
            tournament.joinedList[user.uid]) {

            alert("Already Joined");
            location.href =
                "joinedTournament.html?id=" + tournamentId;
            return;
        }

        // Slot Check
        if ((tournament.joinedPlayers || 0) >= (tournament.slots || 0)) {

            alert("Tournament Full");
            return;

        }

        // Coin Check
        if ((userData.coins || 0) < (tournament.entry || 0)) {

            alert("Coins Kam Hain");
            return;

        }

        // Deduct Coins
        await update(userRef, {

            coins:
            (userData.coins || 0) - Number(tournament.entry)

        });

        // Coin History

        const historyKey =
            push(ref(database, "coinHistory")).key;

        await set(
            ref(database, "coinHistory/" + historyKey),
            {

                uid: user.uid,
                coins: -Number(tournament.entry),
                message: "Tournament Joined - " + tournament.title,
                time: Date.now()

            }
        );

        // Join Tournament

        await update(tournamentRef, {

            joinedPlayers:
                (tournament.joinedPlayers || 0) + 1,

            ["joinedList/" + user.uid + "/name"]:
                ign.value.trim(),

            ["joinedList/" + user.uid + "/gameUid"]:
                uid.value.trim(),

            ["joinedList/" + user.uid + "/mobile"]:
                mobile.value.trim(),

            ["joinedList/" + user.uid + "/joinTime"]:
                Date.now(),

            ["joinedList/" + user.uid + "/status"]:
                "joined"

        });

        alert("Tournament Joined Successfully");

        location.href =
            "joinedTournament.html?id=" + tournamentId;

    } catch (e) {

        console.log(e);
        alert(e.message);

    } finally {

        joinBtn.disabled = false;
        joinBtn.innerText = "Join Tournament";

    }

});