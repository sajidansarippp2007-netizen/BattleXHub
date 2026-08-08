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
const ongoingList = document.getElementById("ongoingList");

onAuthStateChanged(auth,(user)=>{

if(!user){
location.href="login.html";
return;
}

onValue(ref(database,"tournaments"),(snapshot)=>{

ongoingList.innerHTML="";

if(!snapshot.exists()){
ongoingList.innerHTML="<h3>No Match Found</h3>";
return;
}

let found=false;

snapshot.forEach((child)=>{

const t=child.val();

if(
t.joinedList &&
t.joinedList[user.uid] &&
t.status=="live"
){

found=true;

ongoingList.innerHTML+=`

<div class="card">

<img src="${t.banner}" class="bannerImage">

<h2>${t.title}</h2>

<p>🏆 Prize : ${t.prize} Coins</p>

<p>👥 Players : ${t.joinedPlayers}/${t.slots}</p>

<p>🟢 Live Match</p>

<p>🎮 Room ID : ${t.roomId}</p>

<p>🔑 Password : ${t.roomPassword}</p>

<button
class="joinBtn"
onclick="location.href='joinedTournament.html?id=${child.key}'">

Open Match

</button>

</div>

`;

}

});

if(!found){

ongoingList.innerHTML =
"<h3 style='text-align:center;color:gold;'>No Live Match</h3>";

}

});

});