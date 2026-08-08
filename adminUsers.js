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
const userList = document.getElementById("userList");

const usersRef = ref(database, "users");

onValue(usersRef, (snapshot) => {

userList.innerHTML = "";

if (!snapshot.exists()) {

userList.innerHTML = "<h3>No Users Found</h3>";

return;

}

snapshot.forEach((child) => {

const user = child.val();

userList.innerHTML += `

<div class="userCard">

<h3>${user.name || "No Name"}</h3>

<p>📧 ${user.email || "-"}</p>

<p>🪙 Coins : ${user.coins || 0}</p>

<p>👑 Role : ${user.role || "user"}</p>

<div class="actionBtn">

<button
class="addCoin"
onclick="addCoins('${child.key}')">

➕ Add Coins

</button>

<button
class="removeCoin"
onclick="removeCoins('${child.key}')">

➖ Remove Coins

</button>

</div>

</div>

`;

});

});

// =======================
// ADD COINS
// =======================

window.addCoins = async(uid)=>{

showConfirm("User ko coins add karna hai?", async()=>{

const amount = Number(prompt("Kitne Coins Add Karne Hain?"));

if(!amount || amount<=0){

showError("Invalid Amount");

return;

}

const reason = prompt("Reason Likho");

const userRef = ref(database,"users/"+uid);

const snap = await get(userRef);

if(!snap.exists()){

showError("User Not Found");

return;

}

const user = snap.val();

const newCoins = (user.coins || 0) + amount;

await update(userRef,{

coins:newCoins

});

// Coin History

const historyId = push(ref(database,"coinHistory")).key;

await set(

ref(database,"coinHistory/"+historyId),

{

uid:uid,

coins:amount,

message:"Admin Bonus : " + (reason || "Bonus"),

time:Date.now()

}

);

// Notification

const notifyId = push(ref(database,"notifications")).key;

await set(

ref(database,"notifications/"+notifyId),

{

uid:uid,

title:"🎁 Admin Bonus",

message:`${amount} Coins Added\nReason : ${reason || "Bonus"}`,

time:Date.now()

}

);

showSuccess("Coins Successfully Added");

});

};

// =======================
// REMOVE COINS
// =======================

window.removeCoins = async(uid)=>{

showConfirm("User se coins remove karna hai?", async()=>{

const amount = Number(prompt("Kitne Coins Remove Karne Hain?"));

if(!amount || amount<=0){

showError("Invalid Amount");

return;

}

const reason = prompt("Reason Likho");

const userRef = ref(database,"users/"+uid);

const snap = await get(userRef);

if(!snap.exists()){

showError("User Not Found");

return;

}

const user = snap.val();

const newCoins = Math.max(0,(user.coins || 0)-amount);

await update(userRef,{

coins:newCoins

});

// Coin History

const historyId = push(ref(database,"coinHistory")).key;

await set(

ref(database,"coinHistory/"+historyId),

{

uid:uid,

coins:-amount,

message:"Admin Deduction : " + (reason || "Penalty"),

time:Date.now()

}

);

// Notification

const notifyId = push(ref(database,"notifications")).key;

await set(

ref(database,"notifications/"+notifyId),

{

uid:uid,

title:"⚠️ Coins Removed",

message:`${amount} Coins Removed\nReason : ${reason || "Penalty"}`,

time:Date.now()

}

);

showSuccess("Coins Successfully Removed");

});

};