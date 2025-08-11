
import { initializeApp, getApps, cert } from "firebase-admin/app";
import "firebase-admin/auth";

// IMPORTANT: Path to your service account key file
// To get this file:
// 1. Go to your Firebase Project Settings > Service accounts.
// 2. Click "Generate new private key" and download the JSON file.
// 3. Place it in your project (e.g., at the root) and update the path here.
// 4. IMPORTANT: Make sure this file is NOT publicly exposed and is added to your .gitignore.
const serviceAccountKey = process.env.FIREBASE_ADMIN_SDK_CONFIG;

export async function initFirebaseAdmin() {
    if (getApps().length > 0) {
        return;
    }
    if (!serviceAccountKey) {
        throw new Error("FIREBASE_ADMIN_SDK_CONFIG environment variable is not set. Please provide your service account key as a stringified JSON object.");
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e: any) {
        console.error("Failed to parse FIREBASE_ADMIN_SDK_CONFIG. Make sure it's a valid, stringified JSON object.", e);
        throw new Error(`FIREBASE_ADMIN_SDK_CONFIG is not valid JSON. Reason: ${e.message}`);
    }

    try {
        initializeApp({
            credential: cert(serviceAccount)
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error("Error initializing Firebase Admin SDK:", error);
        // This will help debug if the JSON is malformed
        if (error.code === 'app/invalid-credential') {
            console.error("The service account credentials are not valid. Please check the content of your service account key file.");
        }
        throw error;
    }
}
