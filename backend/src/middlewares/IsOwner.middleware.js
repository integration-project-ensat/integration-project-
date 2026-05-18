const prisma = require('../../prisma/client');

const MODELES_CONFIG = {
  projet: {
    model: 'projet',
    idParam: 'id',
    idChamp: 'id_projet',
    ownerChamp: 'id_etudiant',
  },
  stage: {
    model: 'stage',
    idParam: 'id',
    idChamp: 'id_stage',
    ownerChamp: 'id_etudiant',
  },
  activite: {
    model: 'activiteParascolaire',
    idParam: 'id',
    idChamp: 'id_activite',
    ownerChamp: 'id_etudiant',
  },
  portfolio: {
    model: 'portfolio',
    idParam: 'id',
    idChamp: 'id_portfolio',
    ownerChamp: 'id_etudiant',
  },
  commentaire: {
    model: 'commentaire',
    idParam: 'id',
    idChamp: 'id_commentaire',
    ownerChamp: 'id_auteur',
  },
  recommandation: {
    model: 'recommandation',
    idParam: 'id',
    idChamp: 'id_recommandation',
    ownerChamp: 'id_auteur',
  },
  poste: {
    model: 'poste',
    idParam: 'id',
    idChamp: 'id_poste',
    ownerChamp: 'id_etudiant',
  },
  lettre: {
    model: 'lettreRecommandation',
    idParam: 'id',
    idChamp: 'id_lettre',
    ownerChamp: 'id_etudiant',
  },
};

const isOwner = (nomModele, options = {}) => {
  const { allowAdmin = true } = options;

  return async (req, res, next) => {
    try {
      if (!req.utilisateur) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
        });
      }

      if (allowAdmin && req.utilisateur.role === 'ADMINISTRATEUR') {
        return next();
      }

      const config = MODELES_CONFIG[nomModele];
      if (!config) {
        console.error(`[isOwner] Modèle inconnu : "${nomModele}"`);
        return res.status(500).json({
          success: false,
          message: 'Configuration du middleware incorrecte',
        });
      }

      // FIX 1 — Vérifier que le param existe AVANT BigInt()
      const rawId = req.params[config.idParam];
      if (!rawId) {
        return res.status(400).json({
          success: false,
          message: `Paramètre "${config.idParam}" manquant ou invalide`,
        });
      }

      let idRessource;
      try {
        idRessource = BigInt(rawId);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Identifiant de ressource invalide',
        });
      }

      const ressource = await prisma[config.model].findUnique({
        where: { [config.idChamp]: idRessource },
        select: { [config.ownerChamp]: true },
      });

      if (!ressource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource introuvable',
        });
      }

      
      const idProprietaire = BigInt(ressource[config.ownerChamp]);
      const idUtilisateur = BigInt(req.utilisateur.id_utilisateur);

      if (idProprietaire !== idUtilisateur) {
        
        return res.status(404).json({
          success: false,
          message: 'Ressource introuvable',
        });
      }

      next();
    } catch (erreur) {
      console.error('[isOwner]', erreur);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification des droits',
      });
    }
  };
};

module.exports = { isOwner, MODELES_CONFIG };