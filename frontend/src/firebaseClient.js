// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw21JJvJy2YzVf0y6zliC2RRMnuzQRatE",
  authDomain: "e-pharmc.firebaseapp.com",
  projectId: "e-pharmc",
  storageBucket: "e-pharmc.firebasestorage.app",
  messagingSenderId: "567914000407",
  appId: "1:567914000407:web:051a54cfd7036818f4ac52",
  measurementId: "G-4W1YFDJ2EB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Export what you need
export { app, db, auth, collection, getDocs, updateDoc, doc, addDoc, deleteDoc };
