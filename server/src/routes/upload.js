import { Router } from 'express';
import { upload, parseFile, cleanupFile } from '../services/fileParser.js';
import { query } from '../db/index.js';
import { nlpQueue } from '../queue.js';

const router = Router();

router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded', code: 'NO_FILE' });

  try {
    const comments = await parseFile(req.file.path, req.file.originalname);
    await cleanupFile(req.file.path);

    const validComments = comments.filter((c) => c.trim().length > 0);
    if (validComments.length === 0) {
      return res.status(400).json({ error: 'No valid comments found in file', code: 'EMPTY_FILE' });
    }

    const { rows: [session] } = await query(
      `INSERT INTO sessions (filename, status, total_comments)
       VALUES ($1, 'processing', $2)
       RETURNING id`,
      [req.file.originalname, validComments.length]
    );

    const commentIds = [];
    for (const body of validComments) {
      const { rows: [comment] } = await query(
        `INSERT INTO comments (session_id, body) VALUES ($1, $2) RETURNING id`,
        [session.id, body]
      );
      commentIds.push({ id: comment.id, body });
    }

    const jobs = await nlpQueue.addBulk(
      commentIds.map(({ id, body }) => ({
        name: 'analyze-comment',
        data: { sessionId: session.id, commentId: id, body, totalComments: validComments.length },
        opts: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      }))
    );

    res.json({
      sessionId: session.id,
      totalComments: validComments.length,
      jobCount: jobs.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
