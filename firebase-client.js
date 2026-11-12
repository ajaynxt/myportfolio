import { firebaseConfig } from "./firebase-config.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, deleteDoc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-check.js";

const required = ["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"];
const firebaseReady = required.every((key) => {
  const value = firebaseConfig[key];
  return typeof value === "string" && value.trim() && !/^(PASTE_|YOUR_)/.test(value);
});
export { firebaseReady };

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Optional extra abuse protection. Configure a reCAPTCHA v3 site key in Firebase App Check,
// monitor valid traffic first, then enforce Firestore and Storage from the Firebase console.
export const appCheck = app && firebaseConfig.appCheckSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(firebaseConfig.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    })
  : null;

export {
  signInWithPopup, signOut, onAuthStateChanged,
  collection, doc, getDoc, getDocs, query, where, orderBy,
  setDoc, deleteDoc, writeBatch, serverTimestamp,
  ref, uploadBytes, getDownloadURL, deleteObject
};
