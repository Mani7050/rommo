import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyA1bszfT9-ofgasbdp6HTdl4ByFIsHpqbg",
  authDomain: "constructables-f85bb.firebaseapp.com",
  projectId: "constructables-f85bb",
  storageBucket: "constructables-f85bb.firebasestorage.app",
  messagingSenderId: "439307379409",
  appId: "1:439307379409:web:7bcd46964895daeffcdbf0",
  measurementId: "G-JJ5E3FGKLV"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize analytics only on client-side
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export const auth = getAuth(app)
export const db = getFirestore(app)

export { app, analytics }
