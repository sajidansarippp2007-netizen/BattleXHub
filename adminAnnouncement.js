import {
    database,
    ref,
    set
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";

const announcementText = document.getElementById("announcementText");
const publishBtn = document.getElementById("publishBtn");
const status = document.getElementById("status");

publishBtn.onclick = async () => {

    if (announcementText.value.trim() == "") {

        status.innerHTML = "Please enter announcement.";
        return;

    }

    await set(
        ref(database, "announcement"),
        announcementText.value.trim()
    );

    status.innerHTML = "✅ Announcement Published Successfully";

};