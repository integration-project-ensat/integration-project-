// src/middlewares/isOwnerProfil.js
const { ROLES } = require('../config/roles');

const isOwnerProfil = (req, res, next) => {
  const idCible = BigInt(req.params.id);
  const idConnecte = BigInt(req.utilisateur.id_utilisateur);

  if (req.utilisateur.role === ROLES.ADMINISTRATEUR) return next();

  if (idCible !== idConnecte) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé : vous ne pouvez modifier que votre propre profil'
    });
  }

  next();
};

module.exports = isOwnerProfil;