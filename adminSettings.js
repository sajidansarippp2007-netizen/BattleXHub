import {
database,
ref,
get,
set
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const saveBtn = document.getElementById("saveSettings");

// Load Settings
async function loadSettings(){

const snap = await get(ref(database,"settings"));

if(!snap.exists()) return;

const s = snap.val();

document.getElementById("appName").value = s.appName || "";
document.getElementById("appVersion").value = s.appVersion || "";
document.getElementById("maintenance").checked = s.maintenance || false;

document.getElementById("upiId").value = s.upiId || "";
document.getElementById("qrImage").value = s.qrImage || "";

document.getElementById("depositEnabled").checked =
s.depositEnabled ?? true;

document.getElementById("withdrawEnabled").checked =
s.withdrawEnabled ?? true;

document.getElementById("newUserBonus").value =
s.newUserBonus || 0;

document.getElementById("referralBonus").value =
s.referralBonus || 0;

document.getElementById("referralJoinBonus").value =
s.referralJoinBonus || 0;

document.getElementById("referralTournamentBonus").value =
s.referralTournamentBonus || 0;

document.getElementById("tournamentEnabled").checked =
s.tournamentEnabled ?? true;

document.getElementById("roomRevealTime").value =
s.roomRevealTime || 10;

document.getElementById("telegram").value =
s.telegram || "";

document.getElementById("whatsapp").value =
s.whatsapp || "";

document.getElementById("supportEmail").value =
s.supportEmail || "";

document.getElementById("popupNotice").value =
s.popupNotice || "";

document.getElementById("announcement").value =
s.announcement || "";

document.getElementById("forceUpdate").checked =
s.forceUpdate || false;

document.getElementById("latestVersion").value =
s.latestVersion || "";

document.getElementById("updateLink").value =
s.updateLink || "";

document.getElementById("logo").value =
s.logo || "";

document.getElementById("banner").value =
s.banner || "";

}

loadSettings();
// ==========================
// Save Settings
// ==========================

saveBtn.onclick = async () => {

const settings = {

appName: document.getElementById("appName").value,

appVersion: document.getElementById("appVersion").value,

maintenance: document.getElementById("maintenance").checked,

upiId: document.getElementById("upiId").value,

qrImage: document.getElementById("qrImage").value,

depositEnabled:
document.getElementById("depositEnabled").checked,

withdrawEnabled:
document.getElementById("withdrawEnabled").checked,

newUserBonus:
Number(document.getElementById("newUserBonus").value),

referralBonus:
Number(document.getElementById("referralBonus").value),

referralJoinBonus:
Number(document.getElementById("referralJoinBonus").value),

referralTournamentBonus:
Number(document.getElementById("referralTournamentBonus").value),

tournamentEnabled:
document.getElementById("tournamentEnabled").checked,

roomRevealTime:
Number(document.getElementById("roomRevealTime").value),

telegram:
document.getElementById("telegram").value,

whatsapp:
document.getElementById("whatsapp").value,

supportEmail:
document.getElementById("supportEmail").value,

popupNotice:
document.getElementById("popupNotice").value,

announcement:
document.getElementById("announcement").value,

forceUpdate:
document.getElementById("forceUpdate").checked,

latestVersion:
document.getElementById("latestVersion").value,

updateLink:
document.getElementById("updateLink").value,

logo:
document.getElementById("logo").value,

banner:
document.getElementById("banner").value

};

await set(ref(database, "settings"), settings);

showSuccess("Settings Saved Successfully");

};