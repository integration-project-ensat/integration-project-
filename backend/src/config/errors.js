class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Données invalides') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentification requise') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit de données') {
    super(message, 409);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Trop de requêtes, réessayez plus tard') {
    super(message, 429);
  }
}

class InternalError extends AppError {
  constructor(message = 'Erreur serveur interne') {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalError,
};