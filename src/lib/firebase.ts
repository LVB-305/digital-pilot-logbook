import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Don't export auth directly - let components get their own instance
setPersistence(
  getAuth(app),
  typeof window !== "undefined" ? browserLocalPersistence : inMemoryPersistence
).catch((error) => {
  console.error("Auth persistence error:", error);
});
