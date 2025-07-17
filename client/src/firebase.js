import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-p6scJK_jMJTWsd8H3JBzDxZyrzHt-_4",
  authDomain: "insightreplay-aa25f.firebaseapp.com",
  projectId: "insightreplay-aa25f",
  storageBucket: "insightreplay-aa25f.appspot.com",
  messagingSenderId: "956906249850",
  appId: "1:956906249850:web:72a1868c238a00fb67a5c3",
  measurementId: "G-4JESTKXEX3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
