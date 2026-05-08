import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../db/index.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAggregateSummary(sessionId) {
  const { rows: summaries } = await query(
    `SELECT summary, sentiment FROM comments
     WHERE session_id = $1 AND summary IS NOT NULL
     ORDER BY RANDOM()
     LIMIT 50`,
    [sessionId]
  );

  if (summaries.length === 0) return;

  const summaryList = summaries
    .map((r, i) => `${i + 1}. [${r.sentiment}] ${r.summary}`)
    .join('\n');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(
    `Given these ${summaries.length} stakeholder comment summaries:\n\n${summaryList}\n\nWrite a concise 150-word executive overview highlighting key themes, sentiment distribution, and top concerns. Be specific and actionable.`
  );

  const aggregateSummary = result.response.text().trim();

  await query(
    `UPDATE sessions SET aggregate_summary = $1, status = 'done' WHERE id = $2`,
    [aggregateSummary, sessionId]
  );
}
