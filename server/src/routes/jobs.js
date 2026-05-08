import { Router } from 'express';
import { nlpQueue } from '../queue.js';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const job = await nlpQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found', code: 'NOT_FOUND' });

    const state = await job.getState();
    res.json({ id: job.id, state, data: job.data, progress: job.progress || 0 });
  } catch (err) {
    next(err);
  }
});

export default router;
