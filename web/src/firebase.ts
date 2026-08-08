import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithCredential,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

/**
 * Firebase client setup.
 *
 * In dev this points at the Emulator Suite, always — never at production. The
 * config values below are only meaningful for a real deploy; the emulators
 * need nothing but a projectId, which is why local dev works with no secrets
 * and no .env file at all.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "emulator-placeholder-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "cac-medical-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "cac-medical-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "cac-medical-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "387415616698",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "emulator-placeholder-app-id",
};

const app = initializeApp(firebaseConfig);

export const functions = getFunctions(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** True when this build is talking to the local Emulator Suite. */
export const usingEmulator = import.meta.env.DEV;

if (usingEmulator) {
  const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST ?? "127.0.0.1";
  connectFunctionsEmulator(functions, host, Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT ?? 5001));
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}

/** Production sign-in path: Google, no passwords to manage. */
export function signInWithGoogle(): Promise<unknown> {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Emulator-only shortcut: signs in a fake Google user without the popup
 * account-picker, so local dev and demo recordings don't depend on popup
 * windows. The Auth emulator accepts any well-formed fake credential. This
 * function must never be reachable in a production build — callers gate on
 * `usingEmulator`, and the guard here is the backstop.
 */
export function devSignIn(): Promise<unknown> {
  if (!usingEmulator) return Promise.reject(new Error("Dev sign-in is emulator-only"));
  const fakeGoogleIdToken = JSON.stringify({
    sub: "demo-user-1",
    email: "demo@example.com",
    email_verified: true,
    name: "Demo User",
  });
  return signInWithCredential(auth, GoogleAuthProvider.credential(fakeGoogleIdToken));
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Email-link (passwordless) sign-in — the CLAUDE.md-sanctioned email path.
 * No passwords to create, forget, or reset.
 *
 * The email is remembered locally so that opening the link on the SAME device
 * completes silently; a link opened on a different device asks the person to
 * retype their email, which is Firebase's phishing guard (the link alone must
 * not be enough).
 */
const EMAIL_FOR_SIGN_IN_KEY = "medical.emailForSignIn";

export async function sendEmailLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, {
    // Land back on the tracker; Firebase appends the one-time code.
    url: `${window.location.origin}/#/hours`,
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
}

/** True when the current URL is a sign-in link waiting to be completed. */
export function hasPendingEmailLink(): boolean {
  return isSignInWithEmailLink(auth, window.location.href);
}

export function storedEmailForSignIn(): string | null {
  return window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
}

export async function completeEmailLink(email: string): Promise<void> {
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  // The one-time code is spent — strip it from the URL and history so a
  // reload or a shared screenshot doesn't carry it around.
  window.history.replaceState(null, "", `${window.location.pathname}#/hours`);
}
