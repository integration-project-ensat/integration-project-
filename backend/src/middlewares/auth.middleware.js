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
    const decoded = jwt.verify(token, process.env.JWT_SECRET,{
      algorithms: ['HS256']
    });

    const utilisateur = await prisma.utilisateur.findUnique({
      where: {
        id_utilisateur: decoded.userId
      },
      select: {
        id_utilisateur: true,
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
                message: 'Accès non autorisé : utilisateur introuvable'
            });
        }

        if (!utilisateur.est_actif) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé. Contactez l\'administrateur.'
            });
        } 

          if (!utilisateur.email_verifie) {
            return res.status(403).json({
                success: false,
                message: 'Email non vérifié. Veuillez vérifier votre email avant de continuer.'
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
        message: 'Action non autorisée pour votre rôle',
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