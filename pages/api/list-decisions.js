/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { verifyRequest, adminDb } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await verifyRequest(req);

    // Multi-tenant privacy: Query strictly decisions owned by the caller's UID
    const snapshot = await adminDb
      .collection("decisions")
      .where("ownerUid", "==", decodedToken.uid)
      .get();

    // In-memory sorting ensures resilience against missing composite indexes in Firestore
    const decisions = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 100);

    return res.status(200).json({ decisions });
  } catch (err) {
    console.error("Secure list-decisions error:", err);
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
