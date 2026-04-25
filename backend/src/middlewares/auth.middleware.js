const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const { hasPermission } = require('../config/roles');

const authentifier = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accés non autorisé: token manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: {
        id: decoded.userId,
        est_actif: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        est_actif: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé: utilisateur introuvable ou désactivé'
      });
    }

    req.utilisateur = utilisateur;
    next();

  } catch (erreur) {
    if (erreur.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée, veuillez vous reconnecter'
      });
    }
    if (erreur.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    console.error('[authentifier]', erreur);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

const autoriserRoles = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        required: rolesAutorises,
        current: req.utilisateur.role
      });
    }
    next();
  };
};

const authorizePermissions = (permissionArray) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }
    if (!hasPermission(req.utilisateur.role, permissionArray)) {
      return res.status(403).json({
        success: false,
        message: 'Action non autorisee pour votre role'
      });
    }
    next();
  };
};

module.exports = {
  authentifier,
  autoriserRoles,
  authorizePermissions
};