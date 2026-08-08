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
const depositHistoryList =
document.getElementById("depositHistoryList");

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

onValue(ref(database,"depositRequests"),(snapshot)=>{

depositHistoryList.innerHTML="";

if(!snapshot.exists()){

depositHistoryList.innerHTML=
"<h3>No Deposit History</h3>";

return;

}

let found=false;

snapshot.forEach((child)=>{

const d = child.val();

if(d.uid===user.uid){

found=true;

let color="gold";

if(d.status==="approved") color="lime";

if(d.status==="rejected") color="red";

depositHistoryList.innerHTML+=`

<div class="card">

<h3>💰 ₹${d.amount}</h3>

<p>🧾 UTR : ${d.utr || "No UTR"}</p>

<p>Status :
<span style="color:${color}">
${d.status}
</span>
</p>

<p>

📅

${d.time ? new Date(Number(d.time)).toLocaleString("en-IN") : "No Date"}

</p>

</div>

`;

}

});

if(!found){

depositHistoryList.innerHTML=

"<h3>No Deposit History</h3>";

}

});

});