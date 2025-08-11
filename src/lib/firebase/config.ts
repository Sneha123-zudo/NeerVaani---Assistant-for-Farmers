import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUPqFdCV4_ACuSUVXYRVVvXemJ_5MN7A8",
  authDomain: "neervaani-e4bff.firebaseapp.com",
  projectId: "neervaani-e4bff",
  storageBucket: "neervaani-e4bff.firebasestorage.app",
  messagingSenderId: "241447076031",
  appId: "1:241447076031:web:c4e617e0e200a7b5ae060a",
  measurementId: "G-3RNLNSXBQD"
};

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };

// Validate that all required Firebase config values are present
for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value) {
        throw new Error(`Firebase config error: Missing value for NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}. Please check your .env file.`);
    }
}


// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
