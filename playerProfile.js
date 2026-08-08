import {
auth,
database,
ref,
set,
get,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const gameName = document.getElementById("gameName");
const gameUid = document.getElementById("gameUid");
const server = document.getElementById("server");
const saveBtn = document.getElementById("saveBtn");

onAuthStateChanged(auth, async(user)=>{

if(!user){
location.href="login.html";
return;
}

const snap = await get(ref(database,"users/"+user.uid));

if(snap.exists()){

const data = snap.val();

gameName.value = data.gameName || "";
gameUid.value = data.gameUid || "";
server.value = data.server || "";

}

saveBtn.onclick = async()=>{

if(gameName.value=="" || gameUid.value==""){

alert("Game Name aur Game UID bharo");
return;

}

await set(ref(database,"users/"+user.uid+"/gameName"),gameName.value);

await set(ref(database,"users/"+user.uid+"/gameUid"),gameUid.value);

await set(ref(database,"users/"+user.uid+"/server"),server.value);

alert("Game Profile Save Ho Gaya ✅");

history.back();

};

});