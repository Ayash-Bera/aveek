import { Router } from 'express';
import { analyzeComment } from '../services/nlpService.js';

const router = Router();

router.post('/text', async (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field required', code: 'INVALID_INPUT' });
  }
  try {
    const result = await analyzeComment(text);
    if (!result) {
      return res.status(422).json({ error: 'Text too short or language not detected', code: 'UNPROCESSABLE' });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
