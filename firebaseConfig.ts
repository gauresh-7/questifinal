import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPREBe_mleo3i6gSAFDh1p4JDaPiygCkM",
  authDomain: "questifinal.firebaseapp.com",
  projectId: "questifinal",
  storageBucket: "questifinal.firebasestorage.app",
  messagingSenderId: "211357533398",
  appId: "1:211357533398:web:08eb7cbc28e4e14d3f7577",
  measurementId: "G-J9ZC4DRJLH"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);

export { app, auth };
