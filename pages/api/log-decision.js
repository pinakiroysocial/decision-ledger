/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { verifyRequest, adminDb } from "../../lib/firebaseAdmin";
import { structureDecision } from "../../lib/gemini";

// In-memory rate limiting: max 15 requests per 60 seconds per user UID
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const requestHistory = new Map();

function isRateLimited(uid) {
  const now = Date.now();
  const userTimestamps = requestHistory.get(uid) || [];
  const validTimestamps = userTimestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestHistory.set(uid, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  requestHistory.set(uid, validTimestamps);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await verifyRequest(req);
    const uid = decodedToken.uid;

    if (isRateLimited(uid)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment before logging another decision." });
    }

    const { rawText, manualTags } = req.body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 5) {
      return res.status(400).json({ error: "A decision description of at least 5 characters is required." });
    }

    // Protect against prompt injection DOS: enforce max 10,000 characters
    const sanitizedRawText = rawText.trim().slice(0, 10000);

    const structured = await structureDecision(sanitizedRawText);

    if (manualTags) {
      const userTags = Array.isArray(manualTags)
        ? manualTags
        : typeof manualTags === "string"
        ? manualTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];
      
      const cleanUserTags = userTags.map((t) => String(t).replace(/[^\w\s-]/g, "").slice(0, 50)).filter(Boolean);
      const combined = Array.from(new Set([...(structured.tags || []), ...cleanUserTags])).slice(0, 20);
      structured.tags = combined;
    }

    const docRef = await adminDb.collection("decisions").add({
      ...structured,
      rawText: sanitizedRawText,
      ownerUid: uid,
      ownerEmail: decodedToken.email || null,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ id: docRef.id, ...structured });
  } catch (err) {
    console.error("Error logging decision:", err);
    return res.status(err.message === "Missing Authorization header" ? 401 : 500).json({
      error: err.message || "Failed to structure and log decision record."
    });
  }
}
