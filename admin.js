import {
auth,
database,
ref,
onValue,
signOut,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";

/* =========================
ADMIN EMAIL
========================= */

const ADMIN_EMAIL = "fsamar512@gmail.com";

/* =========================
LOGIN CHECK
========================= */

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

if(user.email!==ADMIN_EMAIL){

alert("Access Denied");

location.href="home.html";

return;

}

loadDashboard();

});

/* =========================
LOGOUT
========================= */

const logoutBtn=document.getElementById("logoutBtn");

if(logoutBtn){

logoutBtn.onclick=async()=>{

await signOut(auth);

location.href="login.html";

};

}

console.log("✅ BattleXHub Admin Loaded");
/* =========================
LOAD DASHBOARD
========================= */

function loadDashboard(){

loadUsers();

loadWithdraws();

loadDeposits();

loadTournaments();

setupButtons();

}

/* =========================
TOTAL USERS
========================= */

function loadUsers(){

const totalUsers=document.getElementById("totalUsers");

if(!totalUsers) return;

onValue(ref(database,"users"),snapshot=>{

let total=0;

if(snapshot.exists()){

snapshot.forEach(()=>{

total++;

});

}

totalUsers.innerText=total;

});

}

/* =========================
PENDING WITHDRAW
========================= */

function loadWithdraws(){

const withdrawCount=document.getElementById("withdrawCount");

if(!withdrawCount) return;

onValue(ref(database,"withdrawRequests"),snapshot=>{

let pending=0;

if(snapshot.exists()){

snapshot.forEach(child=>{

const data=child.val();

if(data.status==="pending"){

pending++;

}

});

}

withdrawCount.innerText=pending;

});

}

/* =========================
PENDING DEPOSIT
========================= */

function loadDeposits(){

const depositCard=document.querySelector("[onclick*='adminDeposit.html']");

if(!depositCard) return;

onValue(ref(database,"depositRequests"),snapshot=>{

let pending=0;

if(snapshot.exists()){

snapshot.forEach(child=>{

const data=child.val();

if(data.status==="pending"){

pending++;

}

});

}

depositCard.querySelector("h3").innerHTML=
`Deposit Manager (${pending})`;

});

}
/* =========================
TOTAL TOURNAMENTS
========================= */

function loadTournaments(){

const tournamentCard=
document.getElementById("tournamentCard");

if(!tournamentCard) return;

onValue(ref(database,"tournaments"),snapshot=>{

let total=0;

if(snapshot.exists()){

snapshot.forEach(()=>{

total++;

});

}

const p=tournamentCard.querySelector("span");

if(p){

p.innerHTML=total+" Tournament";

}

});

}

/* =========================
OPEN PAGES
========================= */

function setupButtons(){

const tournamentCard=
document.getElementById("tournamentCard");

if(tournamentCard){

tournamentCard.onclick=()=>{

location.href="adminTournament.html";

};

}

const userManager=
document.getElementById("userManager");

if(userManager){

userManager.onclick=()=>{

location.href="adminUsers.html";

};

}

const withdrawCard=
document.getElementById("withdrawCard");

if(withdrawCard){

withdrawCard.onclick=()=>{

location.href="adminWithdraw.html";

};

}

}

/* =========================
CARD ANIMATION
========================= */

document.querySelectorAll(".card").forEach((card,index)=>{

card.style.opacity="0";

card.style.transform="translateY(30px)";

setTimeout(()=>{

card.style.transition=".35s";

card.style.opacity="1";

card.style.transform="translateY(0)";

},index*70);

});

console.log("🚀 BattleXHub Premium Admin Ready");