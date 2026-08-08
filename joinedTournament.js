import "./appCheck.js";

import {
  auth,
  database,
  ref,
  get,
  onValue,
  onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const box = document.getElementById("tournamentDetails");

const params = new URLSearchParams(location.search);
let tournamentId = params.get("id");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    location.href = "login.html";
    return;
  }

  if (!tournamentId) {

    const snap = await get(ref(database, "tournaments"));

    if (snap.exists()) {
      snap.forEach(child => {
        const t = child.val();

        if (t.joinedList && t.joinedList[user.uid] && !tournamentId) {
          tournamentId = child.key;
        }
      });
    }

    if (!tournamentId) {
      box.innerHTML = "<h2>No Joined Tournament</h2>";
      return;
    }
  }

  loadTournament(user.uid);

});

function loadTournament(uid) {

  onValue(ref(database, "tournaments/" + tournamentId), async (snapshot) => {

    if (!snapshot.exists()) {
      box.innerHTML = `
      <div class="emptyBox">
        <h2>❌ Tournament Not Found</h2>
      </div>`;
      return;
    }

    const t = snapshot.val();

    const joinedSnap = await get(
      ref(database, "tournaments/" + tournamentId + "/joinedList")
    );

    const joinedList = joinedSnap.exists() ? joinedSnap.val() : {};

    let playersHTML = "";

    Object.values(joinedList).forEach(player => {

      playersHTML += `
      <div class="playerCard">

        <img src="assets/logo.png" class="playerPhoto">

        <div class="playerInfo">
          <h3>${player.name}</h3>
          <p>UID : ${player.gameUid}</p>
        </div>

      </div>
      `;

    });

    let roomHTML = "";

const matchTime = Number(t.startTime);
const tenMinutesBefore = matchTime - (10 * 60 * 1000);

if (Date.now() >= tenMinutesBefore) {

  roomHTML = `
  <div class="roomBox">

    <h3>🎮 Room Details</h3>

    <div class="roomItem">
      <span>🆔 Room ID</span>
      <b>${t.roomId || "Not Available"}</b>
    </div>

    <div class="roomItem">
      <span>🔑 Password</span>
      <b>${t.roomPassword || "Not Available"}</b>
    </div>

  </div>
  `;

} else {

  roomHTML = `
  <div class="roomBox">
    <h3>⏳ Room Locked</h3>
    <p>Room ID Match Start hone se 10 minute pehle automatically show hogi.</p>
  </div>
  `;

}

    /* ==========================
       PAGE HTML
    ========================== */

    box.innerHTML = `

    <div class="mainCard">

      <img src="${t.banner}" class="tournamentBanner">

      <h2 class="tournamentTitle">
        ${t.title}
      </h2>

      <div class="countdownBox">
        <div class="countdownTitle">
          ⏳ Match Starts In
        </div>

        <div
          class="countdownTime"
          id="countdown">
          Loading...
        </div>
      </div>

      <div class="infoGrid">

        <div class="infoCard">
          <span>🏆 Prize</span>
          <b>${t.prize}</b>
        </div>

        <div class="infoCard">
          <span>💰 Entry</span>
          <b>${t.entry}</b>
        </div>

        <div class="infoCard">
          <span>💥 Kill</span>
          <b>${t.perKill || 0}</b>
        </div>

        <div class="infoCard">
          <span>🎮 Mode</span>
          <b>${t.mode || "BR"}</b>
        </div>

        <div class="infoCard">
          <span>🗺 Map</span>
          <b>${t.map || "Bermuda"}</b>
        </div>

        <div class="infoCard">
          <span>👥 Players</span>
          <b>${t.joinedPlayers || 0}/${t.slots || 0}</b>
        </div>

      </div>

      ${roomHTML}

      <div class="tabBox">

        <button
          class="tabBtn active"
          id="playersBtn">
          👥 Players
        </button>

        <button
          class="tabBtn"
          id="rulesBtn">
          📜 Rules
        </button>

        <button
          class="tabBtn"
          id="resultBtn">
          🏆 Result
        </button>

      </div>

      <div id="tabContent"></div>

    </div>

    `;

    const tabContent =
      document.getElementById("tabContent");
          /* ==========================
       LIVE COUNTDOWN
    ========================== */

    const countdown =
      document.getElementById("countdown");

    function updateCountdown() {

      if (!t.startTime) {
  countdown.innerHTML = "Time Not Available";
  return;
}

const target = Number(t.startTime);

      const now = Date.now();

      const diff = target - now;

      if (diff <= 0) {
  countdown.innerHTML = "🔴 Match Started";
  return;
}

      const days =
        Math.floor(diff / (1000 * 60 * 60 * 24));

      const hours =
        Math.floor((diff % (1000 * 60 * 60 * 24))
        / (1000 * 60 * 60));

      const minutes =
        Math.floor((diff % (1000 * 60 * 60))
        / (1000 * 60));

      const seconds =
        Math.floor((diff % (1000 * 60))
        / 1000);

      countdown.innerHTML =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

    }

    updateCountdown();

    setInterval(updateCountdown,1000);

    /* ==========================
       PLAYERS TAB
    ========================== */

    function openPlayers(){

      tabContent.innerHTML =
      playersHTML ||

      `
      <div class="emptyBox">
        <h2>😔 No Players Joined</h2>
        <p>No player has joined yet.</p>
      </div>
      `;

    }

    /* ==========================
       RULES TAB
    ========================== */

    function openRules(){

      tabContent.innerHTML =

      `
      <div class="rulesBox">

      <h2>📜 Tournament Rules</h2>

      <p>

      ${t.rules || "No Rules Added"}

      </p>

      </div>
      `;

    }

    /* ==========================
       RESULT TAB
    ========================== */

    function openResult(){

      tabContent.innerHTML =

      `
      <div class="resultBox">

      <h2>🏆 Match Result</h2>

      <p>

      ${t.resultNote || "Result Not Declared Yet"}

      </p>

      </div>
      `;

    }

    openPlayers();
        /* ==========================
       TAB BUTTON EVENTS
    ========================== */

    document.getElementById("playersBtn").onclick = () => {

      document.querySelectorAll(".tabBtn").forEach(btn=>{
        btn.classList.remove("active");
      });

      document
      .getElementById("playersBtn")
      .classList.add("active");

      openPlayers();

    };

    document.getElementById("rulesBtn").onclick = () => {

      document.querySelectorAll(".tabBtn").forEach(btn=>{
        btn.classList.remove("active");
      });

      document
      .getElementById("rulesBtn")
      .classList.add("active");

      openRules();

    };

    document.getElementById("resultBtn").onclick = () => {

      document.querySelectorAll(".tabBtn").forEach(btn=>{
        btn.classList.remove("active");
      });

      document
      .getElementById("resultBtn")
      .classList.add("active");

      openResult();

    };

  }); // onValue End

} // loadTournament End