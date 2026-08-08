import {
    database,
    ref,
    push,
    set,
    get,
    remove
} from "./firebase.js";

import {
    showSuccess,
    showError
} from "./popup.js";

/* =========================
DOM
========================= */

const bannerUrl = document.getElementById("bannerUrl");
const bannerLink = document.getElementById("bannerLink");
const saveBanner = document.getElementById("saveBanner");
const bannerList = document.getElementById("bannerList");
const previewBanner = document.getElementById("previewBanner");

/* =========================
FIREBASE PATH
========================= */

const bannerRef = ref(database, "app/banners");

/* =========================
PREVIEW
========================= */

bannerUrl?.addEventListener("input", () => {

    const url = bannerUrl.value.trim();

    if (!url) {

        previewBanner.style.display = "none";
        return;

    }

    previewBanner.src = url;
    previewBanner.style.display = "block";

});

/* =========================
LOAD BANNERS
========================= */

async function loadBanners() {

    const snap = await get(bannerRef);

    bannerList.innerHTML = "";

    if (!snap.exists()) {

        bannerList.innerHTML = `
        <div class="empty">
            No Banner Added
        </div>`;

        return;

    }

    let banners = [];

    snap.forEach(child => {

        banners.push({
            id: child.key,
            ...child.val()
        });

    });

    banners.sort((a, b) => (b.time || 0) - (a.time || 0));
        banners.forEach((banner) => {

        bannerList.innerHTML += `

        <div class="bannerItem">

            <img src="${banner.image}" alt="Banner">

            <div class="bannerInfo">

                <p>${banner.link}</p>

                <button
                class="deleteBtn"
                onclick="deleteBanner('${banner.id}')">

                🗑 Delete

                </button>

            </div>

        </div>

        `;

    });

}

/* =========================
SAVE BANNER
========================= */

saveBanner?.addEventListener("click", async () => {

    const image = bannerUrl.value.trim();
    const link = bannerLink.value.trim();

    if (!image) {
        showError("Enter Banner Image URL");
        return;
    }

    if (!link) {
        showError("Enter Banner Link");
        return;
    }

    try {

        saveBanner.disabled = true;
        saveBanner.innerText = "Saving...";

        const id = push(bannerRef).key;

        await set(ref(database, "app/banners/" + id), {

            image: image,
            link: link,
            time: Date.now()

        });

        bannerUrl.value = "";
        bannerLink.value = "";

        previewBanner.style.display = "none";

        showSuccess("Banner Added Successfully");

        loadBanners();

    } catch (err) {

        console.error(err);
        showError("Banner Save Failed");

    }

    saveBanner.disabled = false;
    saveBanner.innerText = "➕ Add Banner";

});
/* =========================
DELETE BANNER
========================= */

window.deleteBanner = async (id) => {

    const ok = confirm("Delete this banner?");

    if (!ok) return;

    try {

        await remove(ref(database, "app/banners/" + id));

        showSuccess("Banner Deleted");

        loadBanners();

    } catch (err) {

        console.error(err);

        showError("Delete Failed");

    }

};

/* =========================
AUTO REFRESH
========================= */

setInterval(() => {

    loadBanners();

}, 5000);

/* =========================
INITIAL LOAD
========================= */

loadBanners();

/* =========================
READY
========================= */

console.log("✅ BattleXHub Banner Manager V2 Ready");