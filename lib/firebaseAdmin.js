/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
// This file runs ONLY on the server (inside pages/api routes).
// It uses the service account JSON, which must NEVER be sent to the browser.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "";
  if (raw && !raw.trim().startsWith("{")) {
    try {
      raw = Buffer.from(raw, "base64").toString("utf8");
    } catch (e) {
      // fallback to raw
    }
  }

  const serviceAccount = JSON.parse(raw);

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// Verifies the Firebase ID token sent from the browser in the
// Authorization header. Throws if invalid/expired.
export async function verifyRequest(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    throw new Error("Missing Authorization header");
  }
  return adminAuth.verifyIdToken(token);
}
