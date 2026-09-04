/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { verifyRequest, adminDb } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await verifyRequest(req);
    const { id, title, chosen_option, reasoning, options_considered, tags } = req.body;

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
      return res.status(403).json({ error: "Forbidden: You do not have permission to edit this decision" });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = String(title).slice(0, 300);
    if (chosen_option !== undefined) updateData.chosen_option = String(chosen_option).slice(0, 500);
    if (reasoning !== undefined) updateData.reasoning = String(reasoning).slice(0, 5000);
    if (options_considered !== undefined && Array.isArray(options_considered)) {
      updateData.options_considered = options_considered.map((opt) => String(opt).slice(0, 300)).slice(0, 20);
    }
    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags.map((t) => String(t).trim().toLowerCase().slice(0, 50)).filter(Boolean).slice(0, 30);
    }

    await docRef.update(updateData);

    return res.status(200).json({ success: true, id, ...updateData });
  } catch (err) {
    console.error("Error updating decision:", err);
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
