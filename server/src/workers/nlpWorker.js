import { Worker } from 'bullmq';
import connection from '../redis.js';
import { query } from '../db/index.js';
import { analyzeComment, upsertKeywords } from '../services/nlpService.js';
import { generateAggregateSummary } from '../services/aggregateService.js';

const worker = new Worker(
  'nlp-analysis',
  async (job) => {
    const { sessionId, commentId, body, totalComments } = job.data;

    const result = await analyzeComment(body);

    if (result) {
      await query(
        `UPDATE comments SET sentiment = $1, sentiment_score = $2, summary = $3 WHERE id = $4`,
        [result.sentiment, result.sentiment_score, result.summary, commentId]
      );

      await upsertKeywords(sessionId, result.keywords, totalComments);
    }

    const { rows } = await query(
      `UPDATE sessions
       SET processed_count = processed_count + 1
       WHERE id = $1
       RETURNING processed_count, total_comments, status`,
      [sessionId]
    );

    const session = rows[0];

    if (
      session &&
      session.processed_count >= session.total_comments &&
      session.status === 'processing'
    ) {
      await generateAggregateSummary(sessionId);
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);

  if (job?.data?.sessionId) {
    await query(
      `UPDATE sessions SET status = 'failed' WHERE id = $1 AND status = 'processing'`,
      [job.data.sessionId]
    ).catch(() => {});
  }
});

export default worker;
