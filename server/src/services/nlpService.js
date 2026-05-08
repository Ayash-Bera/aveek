import { GoogleGenerativeAI } from '@google/generative-ai';
import { franc } from 'franc';
import { query } from '../db/index.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a sentiment analysis assistant. Analyze the given stakeholder comment and respond ONLY with valid JSON matching this exact schema:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number between -1.0 and 1.0,
  "summary": "one sentence summary under 20 words",
  "keywords": ["array", "of", "up", "to", "8", "key", "terms"]
}
Do not include any text outside the JSON object.`;

export async function analyzeComment(commentBody) {
  const text = preprocessText(commentBody);
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length < 5) return null;

  const lang = franc(text);
  if (lang === 'und') return null;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent(text);
  const raw = result.response.text().trim();

  let parsed;
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  return {
    sentiment: parsed.sentiment,
    sentiment_score: Math.max(-1, Math.min(1, Number(parsed.score))),
    summary: parsed.summary,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8) : [],
  };
}

function preprocessText(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function upsertKeywords(sessionId, keywords, totalDocs) {
  for (const word of keywords) {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (!normalized) continue;

    await query(
      `INSERT INTO keywords (session_id, word, frequency, tf_idf_weight)
       VALUES ($1, $2, 1, 1.0)
       ON CONFLICT (session_id, word) DO UPDATE
         SET frequency = keywords.frequency + 1,
             tf_idf_weight = (keywords.frequency + 1)::float / GREATEST($3, 1)`,
      [sessionId, normalized, totalDocs]
    );
  }
}
