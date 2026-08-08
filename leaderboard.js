import "./appCheck.js";

import {
auth,
database,
ref,
onValue,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const firstName=document.getElementById("firstName");
const firstCoins=document.getElementById("firstCoins");
const firstPhoto=document.getElementById("firstPhoto");

const secondName=document.getElementById("secondName");
const secondCoins=document.getElementById("secondCoins");
const secondPhoto=document.getElementById("secondPhoto");

const thirdName=document.getElementById("thirdName");
const thirdCoins=document.getElementById("thirdCoins");
const thirdPhoto=document.getElementById("thirdPhoto");

const leaderboardList=document.getElementById("leaderboardList");

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";
return;

}

loadLeaderboard();

});
function loadLeaderboard(){

onValue(ref(database,"users"),(snapshot)=>{

leaderboardList.innerHTML="";

if(!snapshot.exists()){

leaderboardList.innerHTML=`
<div class="loading">
No Players Found
</div>
`;

return;

}

let players=[];

snapshot.forEach((child)=>{

const data=child.val();

players.push({

uid:child.key,

name:data.name || data.username || "Player",

coins:Number(data.coins)||0,

photo:data.photo || "assets/logo.png"

});

});

players.sort((a,b)=>b.coins-a.coins);
/* =========================
TOP 3 PLAYERS
========================= */

if(players[0]){

firstName.innerText=players[0].name;
firstCoins.innerText=players[0].coins;
firstPhoto.src=players[0].photo;

}

if(players[1]){

secondName.innerText=players[1].name;
secondCoins.innerText=players[1].coins;
secondPhoto.src=players[1].photo;

}

if(players[2]){

thirdName.innerText=players[2].name;
thirdCoins.innerText=players[2].coins;
thirdPhoto.src=players[2].photo;

}

/* =========================
ALL PLAYERS LIST
========================= */

players.forEach((player,index)=>{

leaderboardList.innerHTML+=`

<div class="playerItem">

<div class="playerLeft">

<img src="${player.photo}">

<div class="playerInfo">

<h3>#${index+1} ${player.name}</h3>

<p>BattleXHub Player</p>

</div>

</div>

<div class="playerCoins">

🪙 ${player.coins}

</div>

</div>

`;

});
});

}

/* =========================
CONSOLE
========================= */

console.log("🏆 Leaderboard Loaded Successfully");