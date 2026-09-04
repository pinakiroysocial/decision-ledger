/**
 * Decision Ledger – Guest Session Token Minting
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { adminAuth } from "../../lib/firebaseAdmin";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Generate a unique, sandboxed UID for the guest session
    const guestId = `guest_${crypto.randomBytes(6).toString("hex")}`;
    
    // Mint a custom Firebase token with guest claim
    const customToken = await adminAuth.createCustomToken(guestId, {
      role: "guest",
      isAnonymous: true,
    });

    return res.status(200).json({ token: customToken, guestId });
  } catch (err) {
    console.error("Failed to mint guest custom token:", err);
    return res.status(500).json({ error: err.message || "Failed to create guest session" });
  }
}
