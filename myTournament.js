import "./appCheck.js";

import {
auth,
database,
onAuthStateChanged,
ref,
onValue
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const myTournamentList =
document.getElementById("myTournamentList");

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

const tournamentRef =
ref(database,"tournaments");

onValue(tournamentRef,(snapshot)=>{

myTournamentList.innerHTML="";

if(!snapshot.exists()){

myTournamentList.innerHTML=`
<h3 style="text-align:center;color:gold;">
No Tournament Available
</h3>
`;

return;

}

let found=false;

snapshot.forEach((child)=>{

const tournament=child.val();

if(
tournament.joinedList &&
tournament.joinedList[user.uid]
){

found=true;

const banner =
tournament.banner &&
tournament.banner!=""
? tournament.banner
: "assets/banner.jpg";

const status =
tournament.status=="live"
? "🟢 Live"
: tournament.status=="completed"
? "🔴 Completed"
: "🟡 Upcoming";
myTournamentList.innerHTML += `

<div class="card">

<img src="${banner}" class="bannerImage">

<h2>${tournament.title}</h2>

<p>🏆 Prize : ${tournament.prize} Coins</p>

<p>💰 Entry : ${tournament.entry} Coins</p>

<p>👥 Players : ${tournament.joinedPlayers}/${tournament.slots}</p>

<p>💥 Per Kill : ${tournament.perKill || 0} Coins</p>

<p>🗺️ Map : ${tournament.map || "-"}</p>

<p>🎮 Mode : ${tournament.mode || "-"}</p>

<p>🕒 Match Time : ${tournament.matchTime || "Not Set"}</p>

<p>📢 Status : ${status}</p>

${
tournament.roomVisible
?
`
<div class="roomBox">

<p>🎮 Room ID : <b>${tournament.roomId}</b></p>

<p>🔑 Password : <b>${tournament.roomPassword}</b></p>

<p style="color:lime;">
✅ Room Available
</p>

</div>
`
:
`
<div class="roomBox">

<p style="color:gold;">
⏳ Room ID match se 10 minute pehle milegi.
</p>

</div>
`
}

<button
class="joinBtn"
onclick="openTournament('${child.key}')">

View Tournament

</button>

</div>

`;
if(!found){

myTournamentList.innerHTML = `

<h3 style="text-align:center;
color:gold;
margin-top:50px;">

❌ Tumne abhi tak koi Tournament Join nahi kiya.

</h3>

`;

}

});

});

window.openTournament = (id)=>{

location.href =
"joinedTournament.html?id="+id;

};