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
const historyList = document.getElementById("historyList");

onAuthStateChanged(auth, (user) => {

if(!user){
location.href = "login.html";
return;
}

onValue(ref(database,"withdrawRequests"), (snapshot)=>{

historyList.innerHTML = "";

if(!snapshot.exists()){
historyList.innerHTML = "<h3>No Withdraw History</h3>";
return;
}

snapshot.forEach((child)=>{

const data = child.val();

if(data.uid !== user.uid) return;

const date = new Date(data.time || data.requestTime || Date.now());

const onlyDate = date.toLocaleDateString();

const onlyTime = date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

let statusColor="#FFD54F";
let statusIcon="🟡";

if(data.status==="approved"){
statusColor="#00FF66";
statusIcon="🟢";
}

if(data.status==="rejected"){
statusColor="#FF4040";
statusIcon="🔴";
}

historyList.innerHTML += `

<div class="historyCard">

<div class="historyTop">

<h3>💸 Withdraw Request</h3>

</div>

<div class="historyBody">

<p><b>💰 Coins</b><br>${data.coins}</p>

<p><b>🏦 UPI ID</b><br>${data.upi}</p>

<p><b>📊 Status</b><br>

<span style="color:${statusColor}">
${statusIcon} ${data.status}
</span>

</p>

<p><b>📅 Date</b><br>${onlyDate}</p>

<p><b>🕒 Time</b><br>${onlyTime}</p>

</div>

</div>

`;

});

});

});