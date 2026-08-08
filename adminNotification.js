import {
database,
ref,
push,
set,
onValue,
remove
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const message = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const notificationList = document.getElementById("notificationList");
sendBtn.onclick = async () => {

if(message.value==""){
showError("Notification Likho");
return;
}

const id = push(ref(database,"notifications")).key;

await set(ref(database,"notifications/"+id),{

message:message.value,
time:Date.now()

});

showSuccess("Notification Send Ho Gayi");

message.value="";

};
onValue(ref(database,"notifications"),(snapshot)=>{

notificationList.innerHTML="";

if(!snapshot.exists()){
notificationList.innerHTML="<h3>No Notifications</h3>";
return;
}

snapshot.forEach((child)=>{

const id=child.key;
const data=child.val();

notificationList.innerHTML+=`

<div class="card">

<p>${data.message}</p>

<button onclick="deleteNotification('${id}')">
🗑 Delete
</button>

</div>

`;

});

});

window.deleteNotification = async(id)=>{

window.deleteNotification = async(id)=>{

showConfirm("Delete Notification?", async()=>{

await remove(ref(database,"notifications/"+id));

showSuccess("Notification Deleted");

});

};

};