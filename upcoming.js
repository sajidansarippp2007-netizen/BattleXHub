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
const upcomingList = document.getElementById("upcomingList");

onAuthStateChanged(auth,(user)=>{

if(!user){
location.href="login.html";
return;
}

onValue(ref(database,"tournaments"),(snapshot)=>{

upcomingList.innerHTML="";

if(!snapshot.exists()){
upcomingList.innerHTML="<h3>No Tournament Found</h3>";
return;
}

let found=false;

snapshot.forEach((child)=>{

const t=child.val();

if(
t.joinedList &&
t.joinedList[user.uid] &&
t.status==="upcoming"
){

found=true;

upcomingList.innerHTML+=`

<div class="card">

<img src="${t.banner}" class="bannerImage">

<h2>${t.title}</h2>

<p>🏆 Prize : ${t.prize} Coins</p>

<p>💰 Entry : ${t.entry} Coins</p>

<p>👥 Players : ${t.joinedPlayers}/${t.slots}</p>

<p>🕒 Match Time : ${t.matchTime || "Not Set"}</p>

<p style="color:gold;">
⏳ Match Coming Soon
</p>

</div>

`;

}

});

if(!found){

upcomingList.innerHTML=
"<h3 style='text-align:center;color:gold;'>No Upcoming Match</h3>";

}

});

});