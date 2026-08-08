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
const completedList = document.getElementById("completedList");

onAuthStateChanged(auth,(user)=>{

if(!user){
location.href="login.html";
return;
}

onValue(ref(database,"tournaments"),(snapshot)=>{

completedList.innerHTML="";

if(!snapshot.exists()){
completedList.innerHTML="<h3>No Match Found</h3>";
return;
}

let found=false;

snapshot.forEach((child)=>{

const t=child.val();

if(
t.joinedList &&
t.joinedList[user.uid] &&
t.status=="completed"
){

found=true;

completedList.innerHTML+=`

<div class="card">

<img src="${t.banner}" class="bannerImage">

<h2>${t.title}</h2>

<p>🏆 Prize : ${t.prize} Coins</p>

<p>💰 Entry : ${t.entry} Coins</p>

<p>💥 Per Kill : ${t.perKill || 0} Coins</p>

<p>🗺️ Map : ${t.map || "-"}</p>

<p>🎮 Mode : ${t.mode || "-"}</p>

<p>👥 ${t.joinedPlayers}/${t.slots}</p>

<p>🔴 Completed</p>

<button
class="joinBtn"
onclick="location.href='joinedTournament.html?id=${child.key}'">

View Result

</button>

</div>

`;

}

});

if(!found){

completedList.innerHTML=
"<h3 style='text-align:center;color:gold;'>No Completed Match</h3>";

}

});

});