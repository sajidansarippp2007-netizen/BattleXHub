importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCQrnZeLtupA0XuBfnpQaa-OwajwOybOzs",
  authDomain: "battle-x-hub.firebaseapp.com",
  databaseURL: "https://battle-x-hub-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "battle-x-hub",
  storageBucket: "battle-x-hub.firebasestorage.app",
  messagingSenderId: "981781850664",
  appId: "1:981781850664:web:d9a87f463b1538b17de31d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "BattleXHub";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You have a new notification.",
    icon: "/assets/logo.png",
    badge: "/assets/logo.png",
    data: payload.data || {}
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});