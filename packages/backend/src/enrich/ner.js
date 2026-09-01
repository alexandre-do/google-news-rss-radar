import { env } from "../config/env.js";

// Calls the local spaCy NER microservice (packages/ner-service, model:
// en_core_web_sm) — no external LLM API involved. Tags people,
// organizations, places, and generic noun-chunk keywords from article text.
export async function extractNamedEntities(text, { maxKeywords = 25 } = {}) {
  if (!text) return [];

  const res = await fetch(`${env.nerServiceUrl}/ner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, max_keywords: maxKeywords }),
  });

  if (!res.ok) {
    throw new Error(`ner-service responded ${res.status}: ${await res.text()}`);
  }

  return res.json();
}
