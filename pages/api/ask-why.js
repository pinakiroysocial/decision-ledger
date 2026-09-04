/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { verifyRequest, adminDb } from "../../lib/firebaseAdmin";
import { answerFromDecisions } from "../../lib/gemini";

// In-memory rate limiting: max 20 AI queries per 60 seconds per user UID
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const queryHistory = new Map();

function isRateLimited(uid) {
  const now = Date.now();
  const userTimestamps = queryHistory.get(uid) || [];
  const validTimestamps = userTimestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    queryHistory.set(uid, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  queryHistory.set(uid, validTimestamps);
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
      return res.status(429).json({ error: "Too many AI inquiries. Please wait a moment before asking another question." });
    }

    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return res.status(400).json({ error: "A valid question of at least 3 characters is required." });
    }

    const sanitizedQuestion = question.trim().slice(0, 1000);

    // Multi-tenant privacy: Retrieve only decisions belonging to the calling user
    const snapshot = await adminDb
      .collection("decisions")
      .where("ownerUid", "==", uid)
      .get();

    const decisions = snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 25);

    if (decisions.length === 0) {
      return res.status(200).json({
        answer: "You do not have any architectural decisions logged in your personal ledger yet. Use the 'Log Decision' tab or choose one of the 'Quick Templates' to add decisions first, and then Ask Why can analyze and reference them!",
        matchedCount: 0,
      });
    }

    const answer = await answerFromDecisions(sanitizedQuestion, decisions);

    return res.status(200).json({ answer, matchedCount: decisions.length });
  } catch (err) {
    console.error("Error in ask-why handler:", err);
    return res.status(err.message === "Missing Authorization header" ? 401 : 500).json({
      error: err.message || "Failed to process inquiry with Gemini AI."
    });
  }
}
