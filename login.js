import {
auth,
database,
signInWithEmailAndPassword,
ref,
get
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async ()=>{

try{

const result = await signInWithEmailAndPassword(
auth,
email.value,
password.value
);

const uid = result.user.uid;

const snap = await get(ref(database, "users/" + uid));

if (snap.exists()) {

const userData = snap.val();

if (userData.role === "admin") {

window.location.href = "admin.html";

} else {

window.location.href = "home.html";

}

} else {

alert("User Data Not Found");

}

}catch(e){

alert(e.message);

}

});