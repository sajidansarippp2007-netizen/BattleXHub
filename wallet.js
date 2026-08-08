import "./appCheck.js";

import {
auth,
database,
onAuthStateChanged,
ref,
get
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const coinText = document.getElementById("coinText");
const depositAmount = document.getElementById("depositAmount");

// =========================
// Load User Coins
// =========================

onAuthStateChanged(auth, async (user)=>{

if(!user){

location.href="login.html";

return;

}

const snap = await get(ref(database,"users/"+user.uid));

if(snap.exists()){

const data = snap.val();

coinText.innerHTML = data.coins || 0;

}

});

// =========================
// Deposit
// =========================

document.getElementById("depositBtn").onclick = ()=>{

if(depositAmount.value==""){
return;
}

location.href =
"deposit.html?amount=" + depositAmount.value;

};

// =========================
// Withdraw
// =========================

document.getElementById("withdrawBtn").onclick = ()=>{

location.href="withdraw.html";

};

// =========================
// Deposit History
// =========================

document.getElementById("depositHistoryBtn").onclick = ()=>{

location.href="depositHistory.html";

};

// =========================
// Withdraw History
// =========================

document.getElementById("withdrawHistoryBtn").onclick = ()=>{

location.href="withdrawHistory.html";

};

// =========================
// Coin History
// =========================

document.getElementById("coinHistoryBtn").onclick = ()=>{

location.href="coinHistory.html";

};

// =========================
// Tournament History
// =========================

document.getElementById("tournamentHistoryBtn").onclick = ()=>{

location.href="tournamentHistory.html";

};

// =========================
// Side Menu
// =========================

const bottomMenuBtn = document.getElementById("bottomMenuBtn");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");

bottomMenuBtn.onclick = ()=>{

sideMenu.classList.add("show");

overlay.classList.add("show");

};

overlay.onclick = ()=>{

sideMenu.classList.remove("show");

overlay.classList.remove("show");

};