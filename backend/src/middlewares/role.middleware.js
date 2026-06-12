const { ForbiddenError, UnauthorizedError } = require('../config/errors');


const ROLES = {
  ADMINISTRATEUR: 'ADMINISTRATEUR',
  ETUDIANT: 'ETUDIANT',
  PROFESSEUR: 'PROFESSEUR',
  PROFESSIONNEL: 'PROFESSIONNEL',
};

const ROLES_VALIDES = Object.values(ROLES);

/**
 *
 * @param {...string} rolesAutorises - Un ou plusieurs rôles autorisés
 */
const isRole = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return next(new UnauthorizedError('Authentification requise'));
    }

    if (!ROLES_VALIDES.includes(req.utilisateur.role)) {
      console.warn(`[isRole] Rôle invalide détecté : "${req.utilisateur.role}" pour utilisateur ${req.utilisateur.id_utilisateur}`);
      return next(new ForbiddenError('Accès refusé'));
    }

    if (!rolesAutorises.includes(req.utilisateur.role)) {
      console.warn(`[isRole] Accès refusé — rôle requis : [${rolesAutorises.join(', ')}], rôle actuel : ${req.utilisateur.role}`);
      return next(new ForbiddenError('Accès refusé'));
    }

    next();
  };
};

module.exports = { isRole, ROLES };