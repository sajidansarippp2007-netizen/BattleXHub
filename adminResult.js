import {
database,
ref,
get,
update,
push,
set
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const params = new URLSearchParams(location.search);

const tournamentId = params.get("id");

const playerList = document.getElementById("playerList");
const saveAllBtn = document.getElementById("saveAllBtn");

let tournament = null;
let joinedPlayers = [];

async function loadTournament(){

const snap = await get(
ref(database,"tournaments/"+tournamentId)
);

if(!snap.exists()){

playerList.innerHTML=`

<h2 style="text-align:center;color:red;">

❌ Tournament Not Found

</h2>

`;

return;

}

tournament = snap.val();

joinedPlayers = [];

const joined = tournament.joinedList || {};

for(const uid in joined){

joinedPlayers.push({

uid,

...joined[uid]

});

}

playerList.innerHTML="";

}

function renderPlayers(){

playerList.innerHTML="";

joinedPlayers.forEach((player)=>{

playerList.innerHTML+=`

<div class="card">

<h2>👤 ${player.name}</h2>

<p>🆔 UID : ${player.gameUid}</p>

<p>🌍 Server : ${player.server || "-"}</p>

<label>🥇 Rank</label>

<input
type="number"
id="rank_${player.uid}"
placeholder="Rank"
min="1">

<label>🎯 Kills</label>

<input
type="number"
id="kills_${player.uid}"
value="0"
min="0">

<label>🏆 Rank Prize Coins</label>

<input
type="number"
id="prize_${player.uid}"
value="0"
min="0">

<hr>

<p>

💥 Kill Reward :

<b id="killReward_${player.uid}">

0

</b>

Coins

</p>

<p>

🪙 Total Reward :

<b id="totalReward_${player.uid}">

0

</b>

Coins

</p>

</div>

`;

});

joinedPlayers.forEach((player)=>{

const killsInput =
document.getElementById("kills_"+player.uid);

const prizeInput =
document.getElementById("prize_"+player.uid);

function calculate(){

const kills =
Number(killsInput.value)||0;

const prize =
Number(prizeInput.value)||0;

const killReward =
kills*(tournament.perKill||0);

const totalReward =
killReward+prize;

document.getElementById(
"killReward_"+player.uid
).innerHTML = killReward;

document.getElementById(
"totalReward_"+player.uid
).innerHTML = totalReward;

}

killsInput.oninput = calculate;

prizeInput.oninput = calculate;

calculate();

});

}

loadTournament().then(renderPlayers);
saveAllBtn.onclick = async()=>{

showConfirm("Save All Results?", async()=>{

const results = {};

let winner = null;

for(const player of joinedPlayers){

const rank =
Number(document.getElementById("rank_"+player.uid).value)||0;

const kills =
Number(document.getElementById("kills_"+player.uid).value)||0;

const rankPrize =
Number(document.getElementById("prize_"+player.uid).value)||0;

if(rank<=0){

showError("Rank enter karo for " + player.name);

return;

}

const killReward =
kills * (tournament.perKill || 0);

const totalReward =
killReward + rankPrize;

results[player.uid]={

uid:player.uid,

name:player.name,

gameUid:player.gameUid,

server:player.server || "",

rank:rank,

kills:kills,

rankPrize:rankPrize,

killReward:killReward,

totalReward:totalReward

};

if(rank===1){

winner = results[player.uid];

}

// ==========================
// USER UPDATE
// ==========================

const userRef =
ref(database,"users/"+player.uid);

const userSnap =
await get(userRef);

if(userSnap.exists()){

const u = userSnap.val();

await update(userRef,{

coins:(u.coins||0)+totalReward,

matchesPlayed:(u.matchesPlayed||0)+1,

totalWins:
rank===1
?
(u.totalWins||0)+1
:
(u.totalWins||0),

totalEarnings:
(u.totalEarnings||0)+totalReward

});

// ==========================
// COIN HISTORY
// ==========================

const historyId =
push(ref(database,"coinHistory")).key;

await set(

ref(database,"coinHistory/"+historyId),

{

uid:player.uid,

coins:totalReward,

message:
"Tournament Reward - " + tournament.title,

type:"tournament",

rank:rank,

kills:kills,

time:Date.now()

}

);
// ==========================
// Notification Save
// ==========================

const notifyId =
push(ref(database,"notifications")).key;

await set(

ref(database,"notifications/"+notifyId),

{

uid:player.uid,

title:"🏆 Match Result",

message:
`Rank #${rank}
Kills : ${kills}
Reward : ${totalReward} Coins`,

time:Date.now()

}

);

} // userSnap.exists() end

} // for loop end

// ==========================
// Tournament Complete
// ==========================

await update(

ref(database,"tournaments/"+tournamentId),

{

status:"completed",

winnerUid:
winner ? winner.uid : "",

winnerName:
winner ? winner.name : "",

winnerKills:
winner ? winner.kills : 0,

winnerCoins:
winner ? winner.totalReward : 0,

results:results,

completedAt:Date.now()

}

);

// ==========================
// Success
// ==========================

showSuccess("Result Saved Successfully!");

history.back();

});

};