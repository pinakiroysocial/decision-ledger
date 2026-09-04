/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { verifyRequest, adminDb } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await verifyRequest(req);
    const { id } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Decision ID is required" });
    }

    const docRef = adminDb.collection("decisions").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Decision record not found" });
    }

    // IDOR / BOLA Prevention: Verify ownership
    const docData = docSnap.data();
    if (docData.ownerUid && docData.ownerUid !== decodedToken.uid) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to delete this decision" });
    }

    await docRef.delete();

    return res.status(200).json({ success: true, id });
  } catch (err) {
    console.error("Error deleting decision:", err);
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
