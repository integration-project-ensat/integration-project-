const { ForbiddenError, UnauthorizedError } = require('../config/errors');

/**
 * Roles disponibles dans le système PheraCore
 */
const ROLES = {
  ADMINISTRATEUR: 'ADMINISTRATEUR',
  ETUDIANT: 'ETUDIANT',
  PROFESSEUR: 'PROFESSEUR',
  PROFESSIONNEL: 'PROFESSIONNEL',
};

/**
 * Vérifie que l'utilisateur possède AU MOINS UN des rôles autorisés.
 *
 * @param {...string} rolesAutorises - Un ou plusieurs rôles autorisés
 *
 * Usage :
 *   router.get('/admin', authentifier, isRole('ADMINISTRATEUR'), controller.dashboard);
 *   router.post('/valider', authentifier, isRole('ADMINISTRATEUR', 'PROFESSEUR'), controller.valider);
 */
const isRole = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return next(new UnauthorizedError('Authentification requise'));
    }

    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return next(
        new ForbiddenError(
          `Accès refusé. Rôle(s) requis : ${rolesAutorises.join(', ')}`
        )
      );
    }

    next();
  };
};

module.exports = { isRole, ROLES };