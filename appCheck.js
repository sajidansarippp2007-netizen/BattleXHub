import {
database,
ref,
get
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
(async ()=>{

const snap = await get(ref(database,"settings"));

if(!snap.exists()) return;

const settings = snap.val();

if(settings.maintenance === true){

const page =
location.pathname.split("/").pop();

// Maintenance page और Admin Panel को बंद मत करना
if(
page !== "maintenance.html" &&
!page.startsWith("admin")
){

location.replace("maintenance.html");

}

}
// =====================
// Force Update
// =====================

const CURRENT_VERSION = "1.0";

if(settings.forceUpdate === true){

if(settings.latestVersion !== CURRENT_VERSION){

const page =
location.pathname.split("/").pop();

if(
page !== "update.html" &&
page !== "maintenance.html" &&
!page.startsWith("admin")
){

location.replace("update.html");

}

}

}
})();