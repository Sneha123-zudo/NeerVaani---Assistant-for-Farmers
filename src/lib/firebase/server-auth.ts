
import { auth } from "firebase-admin";
import { cookies } from "next/headers";
import { initFirebaseAdmin } from "./firebase-admin";

/**
 * Gets the current user from the session cookie on the server.
 */
export async function getCurrentUser() {
  await initFirebaseAdmin();
  const session = cookies().get("session")?.value;
  if (!session) {
    return null;
  }
  try {
    const decodedIdToken = await auth().verifySessionCookie(session, true);
    return decodedIdToken;
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return null;
  }
}
