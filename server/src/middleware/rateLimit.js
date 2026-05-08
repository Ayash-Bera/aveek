import rateLimit from 'express-rate-limit';

export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads. Try again in 15 minutes.', code: 'RATE_LIMITED' },
});
