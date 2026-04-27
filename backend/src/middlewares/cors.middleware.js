const cors = require('cors')

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',  // DEV
  'http://localhost:3000',                               // backend
  'http://localhost:8081',                               // STAGING frontend
  'http://localhost:80',                                 // nginx staging
  'http://localhost',                                    // nginx prod
  process.env.PROD_URL,                                  // PROD URL
].filter(Boolean)

const originValidator = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  const error = new Error(`CORS policy: Origin '${origin}' is not allowed.`);
  error.statusCode = 403;
  return callback(error, false);
};

const corsOptions = {
  origin: originValidator,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 600,
};

module.exports = cors(corsOptions);