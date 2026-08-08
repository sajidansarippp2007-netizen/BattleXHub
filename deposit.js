import "./appCheck.js";

import {
auth,
database,
ref,
get,
set,
push,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const amountText = document.getElementById("amountText");
const upiText = document.getElementById("upiText");
const qrImage = document.getElementById("qrImage");
const submitPayment = document.getElementById("submitPayment");
const screenshot = document.getElementById("paymentScreenshot");
const utrInput = document.getElementById("utr");

const IMGBB_API_KEY = "b0ae04457a98c0500a51bba9edf28a84";

const params = new URLSearchParams(window.location.search);
const amount = params.get("amount") || 0;

amountText.innerHTML = "Amount : ₹" + amount;

onAuthStateChanged(auth, async (user) => {

if (!user) {
location.href = "login.html";
return;
}

// ===== Load Settings =====

const settingsSnap = await get(ref(database,"settings"));

if(settingsSnap.exists()){

const settings = settingsSnap.val();

// Deposit Enable / Disable

if(settings.depositEnabled === false){

alert("🚫 Deposit is temporarily closed.");

location.href = "wallet.html";

return;

}

// Dynamic UPI

upiText.innerHTML = "UPI ID : " + (settings.upiId || "");

// Dynamic QR

if(settings.qrImage){

qrImage.src = settings.qrImage;

}

}

submitPayment.onclick = async () => {

const utr = utrInput.value.trim();

if(utr === ""){
return;
}

if(!screenshot.files.length){
return;
}

try{

const formData = new FormData();

formData.append("image", screenshot.files[0]);

const upload = await fetch(

"https://api.imgbb.com/1/upload?key=" + IMGBB_API_KEY,

{

method:"POST",

body:formData

}

);

const result = await upload.json();

if(!result.success){
return;
}

const screenshotUrl = result.data.url;

const requestId = push(ref(database,"depositRequests")).key;

await set(ref(database,"depositRequests/"+requestId),{

uid:user.uid,

amount:Number(amount),

utr:utr,

screenshot:screenshotUrl,

status:"pending",

time:Date.now()

});

location.href="wallet.html";

}catch(e){

console.log(e);

}

};

});