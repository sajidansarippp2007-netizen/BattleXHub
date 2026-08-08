let popupCallback=null;

function createPopup(){

if(document.getElementById("popupOverlay")) return;

document.body.insertAdjacentHTML("beforeend",`

<div id="popupOverlay" class="popupOverlay">

<div id="popupBox" class="popupBox">

<div id="popupIcon" class="popupIcon">✅</div>

<div id="popupTitle" class="popupTitle">
Success
</div>

<div id="popupMessage" class="popupMessage">
Done
</div>

<div id="popupButtons" class="popupButtons">

<button id="popupCancel"
class="popupCancel">
Cancel
</button>

<button id="popupOk"
class="popupOk">
OK
</button>

</div>

</div>

</div>

`);

document.getElementById("popupCancel").onclick=closePopup;

document.getElementById("popupOk").onclick=()=>{

closePopup();

if(popupCallback){

popupCallback();

popupCallback=null;

}

};

}

function closePopup(){

document.getElementById("popupOverlay")
.classList.remove("show");

}
function showPopup(type,title,message,callback=null){

createPopup();

popupCallback=callback;

const overlay=document.getElementById("popupOverlay");
const box=document.getElementById("popupBox");

box.className="popupBox "+type;

document.getElementById("popupIcon").innerHTML=
type==="success"?"✅":
type==="error"?"❌":"⚠️";

document.getElementById("popupTitle").innerText=title;

document.getElementById("popupMessage").innerText=message;

const cancelBtn=document.getElementById("popupCancel");

if(type==="success"||type==="error"){

cancelBtn.style.display="none";

}else{

cancelBtn.style.display="block";

}

overlay.classList.add("show");

}

function showSuccess(message){

showPopup(
"success",
"Success",
message
);

}

function showError(message){

showPopup(
"error",
"Error",
message
);

}

function showConfirm(message,callback){

showPopup(
"warning",
"Confirm",
message,
callback
);

}

/* Global */

window.showSuccess=showSuccess;
window.showError=showError;
window.showConfirm=showConfirm;
export { showSuccess, showError, showConfirm };