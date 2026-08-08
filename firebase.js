import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
  push,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";


const firebaseConfig = {
  apiKey: "AIzaSyCQrnZeLtupA0XuBfnpQaa-OwajwOybOzs",
  authDomain: "battle-x-hub.firebaseapp.com",
  databaseURL: "https://battle-x-hub-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "battle-x-hub",
  storageBucket: "battle-x-hub.firebasestorage.app",
  messagingSenderId: "981781850664",
  appId: "1:981781850664:web:d9a87f463b1538b17de31d"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);

const messaging = getMessaging(app);


export {
  app,
  auth,
  database,
  messaging,
  getToken,
  onMessage,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,

  ref,
  get,
  set,
  update,
  onValue,
  push,
  remove
};