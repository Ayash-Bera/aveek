import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { runMigrations } from './db/migrate.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

async function safeImportRouter(path) {
  try {
    const mod = await import(path);
    return mod.default;
  } catch {
    const r = express.Router();
    r.all('*', (req, res) => res.status(503).json({ error: 'Not yet available', code: 'NOT_READY' }));
    return r;
  }
}

async function bootstrap() {
  await runMigrations();

  const uploadRouter = await safeImportRouter('./routes/upload.js');
  const analyzeRouter = await safeImportRouter('./routes/analyze.js');
  const jobsRouter = await safeImportRouter('./routes/jobs.js');
  const sessionsRouter = await safeImportRouter('./routes/sessions.js');

  app.use('/api/upload', uploadRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/sessions', sessionsRouter);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message, code: err.code || 'INTERNAL_ERROR' });
  });

  await import('./workers/nlpWorker.js').catch(() => {});

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
