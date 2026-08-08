import "./appCheck.js";

import {
auth,
database,
ref,
get,
set,
remove,
onValue,
onAuthStateChanged
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const list=document.getElementById("notificationList");
const readAllBtn=document.getElementById("readAllBtn");
const clearBtn=document.getElementById("clearBtn");

let currentUser=null;

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";
return;

}

currentUser=user;

loadNotifications();

});

/* ===========================
LOAD NOTIFICATIONS
=========================== */

function loadNotifications(){

onValue(ref(database,"notifications"),async(snapshot)=>{

list.innerHTML="";

if(!snapshot.exists()){

list.innerHTML=`
<div class="emptyBox">
<h2>🔕 No Notifications</h2>
<p>No Notification Available</p>
</div>
`;

return;

}

const clearSnap=await get(
ref(database,
"users/"+currentUser.uid+"/clearedNotifications")
);

const cleared=
clearSnap.exists()
?clearSnap.val()
:{};

let found=false;

snapshot.forEach(child=>{

const id=child.key;

if(cleared[id]) return;

found=true;

const n=child.val();

list.innerHTML+=`

<div class="notificationCard unread">

<div class="notificationIcon">
🔔
</div>

<div class="notificationContent">

<div class="notificationTitle">

${n.title||"BattleXHub"}

</div>

<div class="notificationMessage">

${n.message||""}

</div>

<div class="notificationTime">

${n.time||""}

</div>

<span class="badge">
NEW
</span>

</div>

</div>

`;

});

if(!found){

list.innerHTML=`
<div class="emptyBox">
<h2>✅ All Clear</h2>
<p>No New Notifications</p>
</div>
`;

}

});

}
/* ===========================
MARK ALL READ
=========================== */

readAllBtn.onclick=()=>{

document
.querySelectorAll(".notificationCard")
.forEach(card=>{

card.classList.remove("unread");
card.classList.add("read");

});

};

/* ===========================
CLEAR ALL (PERMANENT)
=========================== */

clearBtn.onclick=async()=>{

if(!currentUser) return;

const snap=await get(
ref(database,"notifications")
);

if(snap.exists()){

const updates={};

snap.forEach(child=>{

updates[child.key]=true;

});

await set(
ref(
database,
"users/"+currentUser.uid+"/clearedNotifications"
),
updates
);

}

list.innerHTML=`
<div class="emptyBox">

<h2>✅ Cleared</h2>

<p>
All notifications have been cleared.
</p>

</div>
`;

};

/* ===========================
AUTO REFRESH
=========================== */

setInterval(()=>{

if(currentUser){

loadNotifications();

}

},5000);

console.log("✅ Notification V2 Loaded");