const rateLimit = require('express-rate-limit');

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        statusCode: 429,
        message,
        retryAfter: Math.ceil(windowMs / 1000 / 60),
      });
    },
    skip: (req) => req.path === '/health',
  });

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please wait 15 minutes before retrying.',
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
});

const passwordLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please wait 1 hour before retrying.',
});

module.exports = { apiLimiter, authLimiter, passwordLimiter };