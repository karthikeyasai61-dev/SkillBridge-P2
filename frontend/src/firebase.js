import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase Client configuration for project 'ar-explorer-kxthr'
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || window.VITE_FIREBASE_API_KEY || "",
  authDomain: "ar-explorer-kxthr.firebaseapp.com",
  projectId: "ar-explorer-kxthr",
  storageBucket: "ar-explorer-kxthr.appspot.com",
  messagingSenderId: "1072360641990",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1072360641990:web:fallback"
};

let app = null;
let auth = null;

// Initialize Firebase only if the API key is configured
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("🔥 Firebase Client SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Client SDK:", error);
  }
} else {
  console.warn("⚠️ Firebase API Key missing. Google OAuth will fall back to developer mock mode.");
}

export { auth };
