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
const coinHistoryList =
document.getElementById("coinHistoryList");

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

onValue(ref(database,"coinHistory"),(snapshot)=>{

coinHistoryList.innerHTML="";

if(!snapshot.exists()){

coinHistoryList.innerHTML=
"<h3>No Coin History</h3>";

return;

}

let history=[];

snapshot.forEach((child)=>{

const data = child.val();

if(data.uid===user.uid){

history.push(data);

}

});

history.sort((a,b)=>b.time-a.time);

history.forEach((data)=>{

const plus = data.coins > 0;

const date = new Date(data.time);

const onlyDate = date.toLocaleDateString();

const onlyTime = date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

coinHistoryList.innerHTML += `

<div class="historyCard">

<div class="historyTop">

<h3 style="color:${plus ? "#00ff66" : "#ff4040"}">

${plus ? "🟢 +" : "🔴 "}${data.coins} Coins

</h3>

</div>

<div class="historyBody">

<p>

<b>📌 Reason</b><br>

${data.message}

</p>

<p>

<b>📅 Date</b><br>

${onlyDate}

</p>

<p>

<b>🕒 Time</b><br>

${onlyTime}

</p>

</div>

</div>

`;

});

if(history.length===0){

coinHistoryList.innerHTML=

"<h3>No Coin History</h3>";

}

});

});