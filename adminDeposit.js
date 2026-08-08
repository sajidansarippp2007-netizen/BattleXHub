import {
database,
ref,
onValue,
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

const depositList = document.getElementById("depositList");

onValue(ref(database,"depositRequests"),(snapshot)=>{

depositList.innerHTML="";

if(!snapshot.exists()){

depositList.innerHTML="<h2 style='text-align:center'>No Deposit Requests</h2>";

return;

}

snapshot.forEach((child)=>{

const data=child.val();

if(data.status==="approved") return;
if(data.status==="rejected") return;

depositList.innerHTML+=`

<div class="card">

<h3>UID</h3>
<p>${data.uid || "-"}</p>

<h3>Amount</h3>
<p>₹${data.amount || 0}</p>

<h3>UTR</h3>
<p>${data.utr || "Not Provided"}</p>

<h3>Screenshot</h3>

<img src="${data.screenshot || "assets/noimage.png"}">

<button class="approveBtn"
onclick="approveDeposit('${child.key}','${data.uid}',${Number(data.amount) || 0})">

✅ Approve Deposit

</button>
<button class="rejectBtn"
onclick="rejectDeposit('${child.key}','${data.uid}')">

❌ Reject Deposit

</button>
</div>

`;

});

});

window.approveDeposit=async(id,uid,amount)=>{

showConfirm("Deposit Approve Karna Hai?",async()=>{

const userRef=ref(database,"users/"+uid);

const snap=await get(userRef);

if(!snap.exists()){

showError("User Not Found");

return;

}

const user=snap.val();

await update(userRef,{
coins:(user.coins||0)+Number(amount)
});

await update(ref(database,"depositRequests/"+id),{
status:"approved",
approvedAt:Date.now()
});

const historyId=push(ref(database,"coinHistory")).key;

await set(ref(database,"coinHistory/"+historyId),{

uid,
coins:Number(amount),
type:"deposit",
message:"Deposit Approved",
time:Date.now()

});

const notifyId=push(ref(database,"notifications")).key;

await set(ref(database,"notifications/"+notifyId),{

uid,
title:"💰 Deposit Approved",
message:`${amount} Coins Added Successfully`,
time:Date.now()

});

showSuccess("Deposit Approved Successfully");

});

};
window.rejectDeposit = async(id,uid)=>{

showConfirm("Deposit Reject Karna Hai?", async()=>{

await update(ref(database,"depositRequests/"+id),{
status:"rejected",
rejectedAt:Date.now()
});

showSuccess("Deposit Rejected Successfully");

});

};