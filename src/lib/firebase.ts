import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key-for-local-development",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0000000000"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize analytics only on client-side
let analytics
if (typeof window !== "undefined" && firebaseConfig.measurementId && firebaseConfig.measurementId !== "G-0000000000") {
  try {
    analytics = getAnalytics(app)
  } catch (err) {
    console.warn("Firebase Analytics failed to initialize:", err)
  }
}

export const auth = getAuth(app)
export const db = getFirestore(app)

export { app, analytics }

