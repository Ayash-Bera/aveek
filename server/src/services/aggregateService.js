import Anthropic from '@anthropic-ai/sdk';
import { query } from '../db/index.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Given these ${summaries.length} stakeholder comment summaries:\n\n${summaryList}\n\nWrite a concise 150-word executive overview highlighting key themes, sentiment distribution, and top concerns. Be specific and actionable.`,
    }],
  });

  const aggregateSummary = response.content[0].text.trim();

  await query(
    `UPDATE sessions SET aggregate_summary = $1, status = 'done' WHERE id = $2`,
    [aggregateSummary, sessionId]
  );
}
