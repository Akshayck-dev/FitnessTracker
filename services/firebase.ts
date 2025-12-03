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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const messaging = getMessaging(app);

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
