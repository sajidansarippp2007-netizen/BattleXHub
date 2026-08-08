import "./appCheck.js";

import {
auth,
database,
ref,
onAuthStateChanged,
onValue,
update
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const referralCode = document.getElementById("referralCode");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");

const totalReferrals = document.getElementById("totalReferrals");
const totalEarning = document.getElementById("totalEarning");

const referralHistory = document.getElementById("referralHistory");

let currentUser = null;

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";
return;

}

currentUser=user;

loadUserData(user);

});
/* =========================
LOAD USER DATA
========================= */

function loadUserData(user){

onValue(ref(database,"users/"+user.uid),(snapshot)=>{

if(!snapshot.exists()) return;

const data = snapshot.val();

/* Referral Code */

referralCode.value =
data.referralCode || user.uid.substring(0,8).toUpperCase();

/* Total Referrals */

totalReferrals.innerText =
data.totalReferrals || 0;

/* Total Earnings */

totalEarning.innerText =
data.referralCoins || 0;

});

/* Referral History */

onValue(
ref(database,"referrals/"+user.uid),
(snapshot)=>{

referralHistory.innerHTML="";

if(!snapshot.exists()){

referralHistory.innerHTML=`

<div class="emptyBox">

<h2>😔 No Referrals Yet</h2>

<p>

Invite your friends to start earning coins.

</p>

</div>

`;

return;

}

snapshot.forEach(child=>{

const r = child.val();

referralHistory.innerHTML += `

<div class="historyItem">

<h4>${r.name || "New User"}</h4>

<p>🎁 +${r.reward || 100} Coins</p>

<p>${new Date(r.time).toLocaleString()}</p>

</div>

`;

});

});

}
/* =========================
COPY REFERRAL CODE
========================= */

copyBtn.onclick = ()=>{

navigator.clipboard.writeText(referralCode.value);

copyBtn.innerText = "✅ Copied";

setTimeout(()=>{

copyBtn.innerText = "Copy";

},2000);

};

/* =========================
SHARE REFERRAL
========================= */

shareBtn.onclick = ()=>{

const text = `🎮 Join BattleXHub and earn rewards!

🔥 Use my referral code:

${referralCode.value}

Download BattleXHub now!`;

if(navigator.share){

navigator.share({

title:"BattleXHub",

text:text

});

}else{

navigator.clipboard.writeText(text);

}

};
/* =========================
AUTO CREATE REFERRAL CODE
========================= */

onAuthStateChanged(auth, async(user)=>{

if(!user) return;

const userRef = ref(database,"users/"+user.uid);

onValue(userRef, async(snapshot)=>{

if(!snapshot.exists()) return;

const data = snapshot.val();

if(!data.referralCode){

const code = "BXH" + user.uid.substring(0,6).toUpperCase();

await update(userRef,{
referralCode:code
});

}

},{onlyOnce:true});

});

/* =========================
PAGE LOADED
========================= */

document.addEventListener("DOMContentLoaded",()=>{

console.log("✅ Refer & Earn Loaded");

});