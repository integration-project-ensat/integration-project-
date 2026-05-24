// middlewares/roleProtection.js

/**
 * Autorise uniquement les rôles passés en paramètre
 * Usage : router.get('/route', authentifier, allowRoles('ETUDIANT', 'ADMINISTRATEUR'), ctrl)
 */
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôles autorisés : ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = { allowRoles };