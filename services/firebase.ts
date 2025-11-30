
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Configuration updated to match your 'fitspotter-a9f7b' project
const firebaseConfig = {
  apiKey: "AIzaSyAomRwsEobaazfc6IcSih2lEvD_s_fqC9A",
  authDomain: "fitspotter-a9f7b.firebaseapp.com",
  projectId: "fitspotter-a9f7b",
  storageBucket: "fitspotter-a9f7b.appspot.com",
  messagingSenderId: "123456789", // You can find this in Project Settings if needed, but Auth works without it usually
  appId: "1:123456789:web:abcdef" // You can find this in Project Settings if needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign In Error", error);
    throw error;
  }
};
