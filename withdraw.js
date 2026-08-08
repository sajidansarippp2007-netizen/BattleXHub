import "./appCheck.js";

import {
auth,
database,
ref,
set,
push,
get,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const amount = document.getElementById("withdrawAmount");
const upi = document.getElementById("upiId");
const accountName = document.getElementById("accountName");
const mobile = document.getElementById("mobile");
const btn = document.getElementById("withdrawBtn");

onAuthStateChanged(auth, async (user)=>{

if(!user){
location.href="login.html";
return;
}

// ===== Check Withdraw Status =====

const settingsSnap = await get(ref(database,"settings"));

if(settingsSnap.exists()){

const settings = settingsSnap.val();

if(settings.withdrawEnabled === false){

alert("🚫 Withdraw is temporarily closed.");

location.href="wallet.html";
return;

}

}

btn.onclick = async ()=>{

const userSnap = await get(ref(database,"users/"+user.uid));

if(!userSnap.exists()){
return;
}

const userData = userSnap.val();

if(
amount.value=="" ||
upi.value=="" ||
accountName.value=="" ||
mobile.value==""
){
return;
}

const id = push(ref(database,"withdrawRequests")).key;

await set(ref(database,"withdrawRequests/"+id),{

uid:user.uid,
name:userData.name,
coins:Number(amount.value),
upi:upi.value,
accountName:accountName.value,
mobile:mobile.value,
status:"pending",
requestTime:Date.now()

});

location.href="wallet.html";

};

});