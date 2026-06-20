const { AppError } = require('../config/errors');

const ERROR_STATUS_MAP = {
  ValidationError: 400,
  UnauthorizedError: 401,
  ForbiddenError: 403,
  NotFoundError: 404,
  ConflictError: 409,
  TooManyRequestsError: 429,
};

const PRISMA_STATUS_MAP = {
  P2002: 409,
  P2003: 400,
  P2025: 404,
};

const resolveStatusCode = (err) => {
  if (err instanceof AppError) return err.statusCode;
  if (err.code && PRISMA_STATUS_MAP[err.code]) return PRISMA_STATUS_MAP[err.code];
  if (err.statusCode && Number.isInteger(err.statusCode)) return err.statusCode;
  if (err.status && Number.isInteger(err.status)) return err.status;
  if (ERROR_STATUS_MAP[err.name]) return ERROR_STATUS_MAP[err.name];
  return 500;
};

const resolvePrismaMessage = (err) => {
  if (err.code !== 'P2002') return null;

  const targets = Array.isArray(err.meta?.target) ? err.meta.target : [];

  if (targets.includes('email')) return 'Cet email est déjà utilisé.';
  if (targets.includes('numero_etudiant')) return 'Ce numéro étudiant est déjà utilisé.';
  if (targets.includes('code_administratif')) return 'Ce code administratif est déjà utilisé.';
  if (targets.includes('google_id')) return 'Ce compte Google est déjà associé à un utilisateur.';
  if (targets.includes('github_id')) return 'Ce compte GitHub est déjà associé à un utilisateur.';

  return 'Une donnée unique existe déjà.';
};

const resolveClientMessage = (err, statusCode) => {
  if (err instanceof AppError) return err.message;
  const prismaMessage = resolvePrismaMessage(err);
  if (prismaMessage) return prismaMessage;
  if (statusCode >= 400 && statusCode < 500) return 'Bad request.';
  return 'An internal server error occurred. Please try again later.';
};

const sanitizeUrl = (url) => {
  if (!url) return '';
  return url.replace(/[^\x20-\x7E]/g, '?'); 
};

const errorMiddleware = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      statusCode: 413,
      message: 'Fichier trop lourd. Maximum 5 MB.',
    });
  }

  if (err.message?.includes('Format non supporté')) {
    return res.status(415).json({
      success: false,
      statusCode: 415,
      message: err.message,
    });
  }

  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = resolveStatusCode(err);
  const clientMessage = resolveClientMessage(err, statusCode);

  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: sanitizeUrl(req.originalUrl),
    statusCode,
    errorName: err.name || 'Error',
    message: err.message,

    ...(isDev && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    console.error('[CRITICAL ERROR]', JSON.stringify(logEntry, null, 2));
  } else {
    console.warn('[CLIENT ERROR]', JSON.stringify(logEntry, null, 2));
  }

  if (res.headersSent) return next(err);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: clientMessage,
  });
};

module.exports = errorMiddleware;
