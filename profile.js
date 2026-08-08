import "./appCheck.js";

import {
auth,
database,
ref,
get,
set,
update,
signOut,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const profilePhoto = document.getElementById("profilePhoto");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const userCoins = document.getElementById("userCoins");
const totalWins = document.getElementById("totalWins");
const matchesPlayed = document.getElementById("matchesPlayed");
const totalEarnings = document.getElementById("totalEarnings");

const referralCode = document.getElementById("referralCode");
const copyReferral = document.getElementById("copyReferral");

const logoutBtn = document.getElementById("logoutBtn");

/* ===========================
CHECK LOGIN
=========================== */

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="login.html";
return;

}

loadProfile(user);

});

/* ===========================
LOAD PROFILE
=========================== */

async function loadProfile(user){

const snap = await get(ref(database,"users/"+user.uid));

if(!snap.exists()) return;

const data = snap.val();

userName.innerText =
data.name ||
user.email.split("@")[0];

userEmail.innerText =
"Esports Tournament";

userCoins.innerText =
data.coins || 0;

totalWins.innerText =
data.wins || 0;

matchesPlayed.innerText =
data.matchesPlayed || 0;

totalEarnings.innerText =
data.totalEarnings || 0;
/* ===========================
PROFILE PHOTO
=========================== */

if(data.photo){

profilePhoto.src = data.photo;

}else{

profilePhoto.src = "assets/logo.png";

}

/* ===========================
REFERRAL CODE
=========================== */

let code = data.referralCode;

if(!code){

code = "BXH" + user.uid.substring(0,6).toUpperCase();

await update(ref(database,"users/"+user.uid),{

referralCode:code

});

}

referralCode.value = code;

}

/* ===========================
COPY REFERRAL
=========================== */

copyReferral.onclick = ()=>{

navigator.clipboard.writeText(referralCode.value);

};
/* ===========================
LOGOUT
=========================== */

logoutBtn.onclick = async ()=>{

await signOut(auth);

location.href = "login.html";

};

/* ===========================
OPEN PAGES
=========================== */

window.openWallet = ()=>{

location.href = "wallet.html";

};

window.openRefer = ()=>{

location.href = "refer.html";

};

window.openLeaderboard = ()=>{

location.href = "leaderboard.html";

};

window.openNotification = ()=>{

location.href = "notification.html";

};

window.openAbout = ()=>{

location.href = "about.html";

};

window.openPrivacy = ()=>{

location.href = "privacy.html";

};

window.openTerms = ()=>{

location.href = "terms.html";

};

/* ===========================
PROFILE LOADED
=========================== */

console.log("✅ BattleXHub Profile Loaded Successfully");
/* ===========================
AUTO REFRESH PROFILE
=========================== */

document.addEventListener("visibilitychange",()=>{

if(document.visibilityState==="visible"){

const user = auth.currentUser;

if(user){

loadProfile(user);

}

}

});

/* ===========================
PROFILE IMAGE ERROR
=========================== */

profilePhoto.onerror = ()=>{

profilePhoto.src = "assets/logo.png";

};

/* ===========================
WELCOME MESSAGE
=========================== */

console.log("👤 BattleXHub Premium Profile Ready");

console.log("✅ All Profile Features Loaded");