/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user") {
      console.warn("Google sign-in popup was cancelled or closed.");
      return null;
    }
    throw error;
  }
}

export async function loginAnonymously() {
  try {
    return await signInAnonymously(auth);
  } catch (error) {
    console.warn("Direct Firebase anonymous auth failed (" + (error.code || error.message) + "). Attempting server-minted guest session...");
    try {
      const res = await fetch("/api/guest-session", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.token) {
        return await signInWithCustomToken(auth, data.token);
      }
    } catch (fallbackError) {
      console.error("Guest token fallback error:", fallbackError);
    }
    throw error;
  }
}

export function logout() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
