import { firebaseConfig } from "./firebase-config.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, deleteDoc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const values = Object.values(firebaseConfig).map(String);
const hasPlaceholder = values.some((value) => /^(PASTE_|YOUR_)/.test(value));
export const firebaseReady = values.length === 6 && values.every(Boolean) && !hasPlaceholder;

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  signInWithPopup, signOut, onAuthStateChanged,
  collection, doc, getDoc, getDocs, query, where, orderBy,
  setDoc, deleteDoc, writeBatch, serverTimestamp,
  ref, uploadBytes, getDownloadURL, deleteObject
};
