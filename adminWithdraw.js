import {
database,
ref,
onValue,
update,
get,
push,
set
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const withdrawList = document.getElementById("withdrawList");

onValue(ref(database,"withdrawRequests"),(snapshot)=>{

withdrawList.innerHTML="";

if(!snapshot.exists()){

withdrawList.innerHTML="<h3>No Withdraw Requests</h3>";

return;

}

snapshot.forEach((child)=>{

const data=child.val();

if(data.status!=="pending") return;

const time=data.requestTime
?new Date(data.requestTime).toLocaleString()
:"-";

withdrawList.innerHTML+=`

<div class="card">

<h3>UID</h3>
<p style="word-break:break-all;overflow-wrap:anywhere;color:#00e5ff;font-weight:bold;">
${data.uid}
</p>

<h3>Name</h3>
<p>${data.name||"Unknown"}</p>

<h3>Coins</h3>
<p>${data.coins}</p>

<h3>Account Name</h3>
<p>${data.accountName}</p>

<h3>UPI ID</h3>
<p>${data.upi}</p>

<h3>Mobile</h3>
<p>${data.mobile}</p>

<h3>Request Time</h3>
<p>${time}</p>

<button onclick="approveWithdraw('${child.key}','${data.uid}',${data.coins})">
✅ Approve
</button>

<button onclick="rejectWithdraw('${child.key}')">
❌ Reject
</button>

</div>

`;

});

});
window.approveWithdraw = async(id,uid,coins)=>{

showConfirm("Kya payment bhej diya?", async()=>{

const userRef = ref(database,"users/"+uid);

const snap = await get(userRef);

if(!snap.exists()){

showError("User Not Found");

return;

}

const user = snap.val();

const currentCoins = Number(user.coins || 0);

if(currentCoins < Number(coins)){

showError("User ke paas itne coins nahi hain");

return;

}

// Coins Deduct
await update(userRef,{
coins:currentCoins-Number(coins)
});

// Withdraw Request Update
await update(ref(database,"withdrawRequests/"+id),{
status:"approved",
approvedAt:Date.now()
});

// Coin History
const historyId = push(ref(database,"coinHistory")).key;

await set(ref(database,"coinHistory/"+historyId),{

uid:uid,

coins:-Number(coins),

type:"withdraw",

message:"Withdraw Approved",

time:Date.now()

});

// Notification
const notifyId = push(ref(database,"notifications")).key;

await set(ref(database,"notifications/"+notifyId),{

uid:uid,

title:"💸 Withdraw Approved",

message:`${coins} Coins Withdraw Approved Successfully`,

time:Date.now()

});

showSuccess("Withdraw Approved Successfully");

});

};
// ============================
// Reject Withdraw
// ============================

window.rejectWithdraw = async(id)=>{

showConfirm("Kya Withdraw Reject Karna Hai?", async()=>{

const requestRef = ref(database,"withdrawRequests/"+id);

const snap = await get(requestRef);

if(!snap.exists()){

showError("Withdraw Request Not Found");

return;

}

const data = snap.val();

// Request Reject
await update(requestRef,{
status:"rejected",
rejectedAt:Date.now()
});

// Notification
const notifyId = push(ref(database,"notifications")).key;

await set(ref(database,"notifications/"+notifyId),{

uid:data.uid,

title:"❌ Withdraw Rejected",

message:"Aapka Withdraw Request Reject Kar Diya Gaya.",

time:Date.now()

});

showSuccess("Withdraw Rejected Successfully");

});

};