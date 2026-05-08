import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

router.get('/:id/results', async (req, res, next) => {
  try {
    const { rows: [session] } = await query('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
    if (!session) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });

    const { rows: sentimentCounts } = await query(
      `SELECT sentiment, COUNT(*)::int as count
       FROM comments WHERE session_id = $1 AND sentiment IS NOT NULL
       GROUP BY sentiment`,
      [req.params.id]
    );

    const { rows: keywords } = await query(
      `SELECT word, frequency, tf_idf_weight
       FROM keywords WHERE session_id = $1
       ORDER BY tf_idf_weight DESC LIMIT 20`,
      [req.params.id]
    );

    const counts = { positive: 0, negative: 0, neutral: 0 };
    for (const row of sentimentCounts) {
      if (row.sentiment) counts[row.sentiment] = row.count;
    }

    res.json({
      session,
      sentimentCounts: counts,
      keywords,
      aggregateSummary: session.aggregate_summary,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const { sentiment, keyword, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'session_id = $1';
    const params = [req.params.id];
    let paramIdx = 2;

    if (sentiment && ['positive', 'negative', 'neutral'].includes(sentiment)) {
      whereClause += ` AND sentiment = $${paramIdx++}`;
      params.push(sentiment);
    }

    if (keyword) {
      whereClause += ` AND body ILIKE $${paramIdx++}`;
      params.push(`%${keyword}%`);
    }

    const { rows: comments } = await query(
      `SELECT id, body, sentiment, sentiment_score, summary
       FROM comments WHERE ${whereClause}
       ORDER BY sentiment_score DESC NULLS LAST
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      [...params, parseInt(limit), offset]
    );

    const { rows: [{ count }] } = await query(
      `SELECT COUNT(*)::int as count FROM comments WHERE ${whereClause}`,
      params
    );

    res.json({ comments, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/export', async (req, res, next) => {
  try {
    const { rows: [session] } = await query('SELECT filename FROM sessions WHERE id = $1', [req.params.id]);
    if (!session) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });

    const { rows: comments } = await query(
      `SELECT id, body, sentiment, sentiment_score, summary
       FROM comments WHERE session_id = $1 ORDER BY sentiment_score DESC NULLS LAST`,
      [req.params.id]
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="results.csv"`);

    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    res.write('id,body,sentiment,sentiment_score,summary\n');
    for (const c of comments) {
      res.write(`${escape(c.id)},${escape(c.body)},${escape(c.sentiment)},${escape(c.sentiment_score)},${escape(c.summary)}\n`);
    }
    res.end();
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM sessions WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
