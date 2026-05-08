import { Queue, QueueEvents } from 'bullmq';
import connection from './redis.js';

export const nlpQueue = new Queue('nlp-analysis', { connection });

export const nlpQueueEvents = new QueueEvents('nlp-analysis', { connection });
