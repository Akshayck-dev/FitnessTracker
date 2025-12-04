import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAzUpxTaGLN3uFCLtwimtjpAtODz_7GftE",
  authDomain: "fitspotter-a9f7b.firebaseapp.com",
  projectId: "fitspotter-a9f7b",
  storageBucket: "fitspotter-a9f7b.firebasestorage.app",
  messagingSenderId: "733811785720",
  appId: "1:733811785720:web:570aadb2db9ca9f2f1e00d",
  measurementId: "G-68QJEZDM9S"
};

// Initialize Firebase
let app;
let analytics;
let auth;
let googleProvider;
let db;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Fallback or re-throw depending on severity. 
  // For now, let's log it so the global handler catches it if it's critical, 
  // or allow the app to load with limited functionality.
}

export { auth, googleProvider, db, messaging };

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign In Error", error);
    throw error;
  }
};

export { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink };
