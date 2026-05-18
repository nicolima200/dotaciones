import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNTTOdNec5j5nPYAdi8wVxve21gQPbfjw",
  authDomain: "dotaciones-uppl.firebaseapp.com",
  projectId: "dotaciones-uppl",
  storageBucket: "dotaciones-uppl.firebasestorage.app",
  messagingSenderId: "310982242107",
  appId: "1:310982242107:web:208cb20bec30da4a86911e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
