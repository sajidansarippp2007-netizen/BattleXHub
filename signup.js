import {
  auth,
  createUserWithEmailAndPassword,
  database,
  ref,
  set,
  get,
  update,
  push
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const referralInput = document.getElementById("referralInput");
const signupBtn = document.getElementById("signupBtn");
const status = document.getElementById("status");

signupBtn.addEventListener("click", async () => {

  const fullName = name.value.trim();
  const userEmail = email.value.trim();
  const userPassword = password.value.trim();
  const referralCode = referralInput.value.trim().toUpperCase();

  if (
    fullName === "" ||
    userEmail === "" ||
    userPassword === ""
  ) {
    status.innerHTML = "Please fill all fields";
    return;
  }

  status.innerHTML = "Creating Account...";

  let referralOwner = null;

  if (referralCode !== "") {

    const usersSnap = await get(ref(database, "users"));

    if (usersSnap.exists()) {

      const users = usersSnap.val();

      for (const id in users) {

        if (users[id].referralCode === referralCode) {

          referralOwner = {
            uid: id,
            data: users[id]
          };

          break;
        }

      }

    }

    if (!referralOwner) {

      status.innerHTML = "Invalid Referral Code";

      return;

    }

  }

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );

    const uid = userCredential.user.uid;

    const myReferralCode =
      "BXH" +
      Math.random()
      .toString(36)
      .substring(2,8)
      .toUpperCase();

    await set(
      ref(database,"users/"+uid),
      {
        name:fullName,
        email:userEmail,
        coins: referralOwner ? 5 : 0,
        totalWins:0,
        totalEarnings:0,
        matchesPlayed:0,
        role:"user",
        referralCode:myReferralCode
      }
    );
        // =========================
    // Referral Bonus
    // =========================

    if (referralOwner) {

      // Referrer Coins
      await update(
        ref(database, "users/" + referralOwner.uid),
        {
          coins: (referralOwner.data.coins || 0) + 10
        }
      );

      // Referrer Coin History
      const refHistoryId =
        push(ref(database, "coinHistory")).key;

      await set(
        ref(database, "coinHistory/" + refHistoryId),
        {
          uid: referralOwner.uid,
          coins: 10,
          message: "Referral Bonus",
          time: Date.now()
        }
      );

      // New User Coin History
      const newHistoryId =
        push(ref(database, "coinHistory")).key;

      await set(
        ref(database, "coinHistory/" + newHistoryId),
        {
          uid: uid,
          coins: 5,
          message: "Referral Bonus",
          time: Date.now()
        }
      );

      // Referrer Notification
      const notify1 =
        push(ref(database, "notifications")).key;

      await set(
        ref(database, "notifications/" + notify1),
        {
          uid: referralOwner.uid,
          title: "🎁 Referral Bonus",
          message: "You received 10 Coins from referral.",
          time: Date.now()
        }
      );

      // New User Notification
      const notify2 =
        push(ref(database, "notifications")).key;

      await set(
        ref(database, "notifications/" + notify2),
        {
          uid: uid,
          title: "🎉 Welcome Bonus",
          message: "You received 5 Coins using referral code.",
          time: Date.now()
        }
      );

    }

    status.innerHTML = "Account Created Successfully ✅";

    setTimeout(() => {

      location.href = "login.html";

    },1000);

  } catch(error){

    status.innerHTML = error.message;

  }

});