import {
database,
ref,
get,
update
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const playerList = document.getElementById("playerList");

const params = new URLSearchParams(location.search);
const tournamentId = params.get("id");

loadPlayers();

async function loadPlayers(){

const snap = await get(ref(database,"tournaments/"+tournamentId));

if(!snap.exists()){

playerList.innerHTML="<h3>Tournament Not Found</h3>";

return;

}

const tournament = snap.val();

playerList.innerHTML="";

const joined = tournament.joinedList || {};

for(const uid in joined){

const p = joined[uid];

playerList.innerHTML += `

<div class="card">

<h2>${p.name}</h2>
${tournament.winner==uid
?
`<p style="color:gold;font-weight:bold;">
🏆 WINNER
</p>`
:
""
}
<p>UID : ${p.gameUid}</p>

<p>Server : ${p.server}</p>
<p>Join Time : ${new Date(p.joinTime).toLocaleString()}</p>
<button onclick="declareWinner('${uid}')">

🏆 Declare Winner

</button>

</div>

`;

}

}

window.declareWinner = async(uid)=>{

const tournamentSnap = await get(ref(database,"tournaments/"+tournamentId));

const tournament = tournamentSnap.val();
if(tournament.status=="completed"){

showError("Winner Already Declare Ho Chuka Hai");

return;

}
const userRef = ref(database,"users/"+uid);

const userSnap = await get(userRef);

if(!userSnap.exists()){

showError("User Not Found");

return;

}

const user = userSnap.val();

await update(userRef,{

coins:(user.coins||0)+tournament.prize

});

await update(ref(database,"tournaments/"+tournamentId),{

winner:uid,
winnerName: user.gameName || user.name,
status:"completed"

});

showSuccess("🏆 Winner Declare Ho Gaya!");

location.reload();

};