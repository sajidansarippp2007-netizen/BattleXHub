import {
    auth,
    database,
    app,
    ref,
    push,
    set
} from "./firebase.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

import {
    onAuthStateChanged
} from "./firebase.js";


/* =========================================
   BATTLEXHUB PUSH NOTIFICATION SYSTEM
========================================= */

const VAPID_KEY =
"BjAD2IoFkwFgg1geTor2EUlYC4POMb64rJw2DNKOtidpLf3SaET2Yj2NP3aOex4IXKFlMQSFkDXp3sAUnWBv68U";


let pushStarted = false;


/* =========================================
   START PUSH NOTIFICATIONS
========================================= */

async function startPushNotifications(user) {

    if (pushStarted) return;

    pushStarted = true;

    try {

        /* Browser notification support check */

        if (!("Notification" in window)) {

            console.log(
                "❌ This browser does not support notifications."
            );

            return;
        }


        /* Service Worker support check */

        if (!("serviceWorker" in navigator)) {

            console.log(
                "❌ Service Worker not supported."
            );

            return;
        }


        /* Ask notification permission */

        let permission = Notification.permission;

        if (permission === "default") {

            permission =
                await Notification.requestPermission();

        }


        if (permission !== "granted") {

            console.log(
                "🔕 Notification permission not granted."
            );

            return;
        }


        console.log(
            "✅ Notification permission granted."
        );


        /* =========================================
           REGISTER FIREBASE SERVICE WORKER
        ========================================= */

        const serviceWorkerRegistration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );


        console.log(
            "✅ Firebase messaging service worker registered."
        );


        /* =========================================
           GET FIREBASE MESSAGING INSTANCE
        ========================================= */

        const messaging =
    getMessaging(app);


        /* =========================================
           GET FCM TOKEN
        ========================================= */

        const token = await getToken(
            messaging,
            {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration:
                    serviceWorkerRegistration
            }
        );


        if (!token) {

            console.log(
                "❌ FCM token was not generated."
            );

            return;
        }


        console.log(
            "✅ FCM TOKEN:",
            token
        );
alert("FCM TOKEN:\n\n" + token);

        /* =========================================
           SAVE TOKEN TO FIREBASE DATABASE

           One user can have multiple devices.
        ========================================= */

        const tokenRef =
            push(
                ref(
                    database,
                    "users/" +
                    user.uid +
                    "/pushTokens"
                )
            );


        await set(
    tokenRef,
    {
        token: token,
        createdAt: Date.now(),
        platform: navigator.userAgent,
        permission: "granted"
    }
);


        console.log(
            "✅ Push token saved to Firebase."
        );


        /* =========================================
           FOREGROUND PUSH NOTIFICATION
        ========================================= */

        onMessage(
            messaging,
            (payload) => {

                console.log(
                    "🔔 BattleXHub Push:",
                    payload
                );


                const title =
                    payload.notification?.title ||
                    payload.data?.title ||
                    "BattleXHub";


                const body =
                    payload.notification?.body ||
                    payload.data?.body ||
                    "You have a new notification.";


                /* Show notification while app is open */

                if (
                    Notification.permission ===
                    "granted"
                ) {

                    new Notification(
                        title,
                        {
                            body: body,
                            icon:
                                "/assets/logo.png",
                            badge:
                                "/assets/logo.png",
                            tag:
                                "battlexhub"
                        }
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "❌ BattleXHub Push Error:",
            error
        );

    }

}


/* =========================================
   CHECK LOGIN USER
========================================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            console.log(
                "ℹ️ User not logged in."
            );

            return;
        }


        console.log(
            "🔔 Starting BattleXHub push system..."
        );


        startPushNotifications(user);

    }
);


/* =========================================
   EXPORT
========================================= */

export {
    startPushNotifications
};