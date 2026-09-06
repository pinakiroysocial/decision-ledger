/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3-flash-preview"];

async function generateWithFallback(prompt, isJson = false) {
  let lastError;
  for (const modelName of MODELS) {
    try {
      const config = isJson ? { responseMimeType: "application/json" } : {};
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: config });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(`Model ${modelName} failed (${err.message}), trying fallback...`);
      lastError = err;
    }
  }
  throw lastError;
}

// Turns freeform decision text into a structured object.
export async function structureDecision(rawText) {
  const prompt = `You are extracting a structured decision record from a user's freeform note.
Return valid JSON matching exactly this shape:
{
  "title": "short title for the decision",
  "options_considered": ["option A", "option B"],
  "chosen_option": "the option that was picked",
  "reasoning": "why it was picked, in 1-3 sentences",
  "tags": ["keyword1", "keyword2"]
}

User's note:
"""${rawText}"""`;

  const text = await generateWithFallback(prompt, true);
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw parseErr;
  }
}

// Answers a "why did we choose X" style question given a set of
// matching decision documents pulled from Firestore.
export async function answerFromDecisions(question, decisions) {
  const context = decisions
    .map(
      (d, i) =>
        `Decision ${i + 1}: "${d.title}"\nOptions considered: ${d.options_considered.join(", ")}\nChosen: ${d.chosen_option}\nReasoning: ${d.reasoning}\nLogged: ${d.createdAt}`
    )
    .join("\n\n");

  const prompt = `You are answering a question using ONLY the decision log entries below.
If the entries don't contain the answer, say so plainly instead of guessing.
Cite which decision(s) you drew from by their title.

Decision log:
${context || "(no matching entries found)"}

Question: ${question}`;

  const text = await generateWithFallback(prompt, false);
  return text.trim();
}
