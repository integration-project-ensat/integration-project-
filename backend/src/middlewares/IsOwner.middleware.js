const prisma = require('../../prisma/client');

/**
 * Modèles supportés et leur configuration d'ownership
 * - model     : nom du modèle Prisma
 * - idParam   : nom du paramètre URL (req.params)
 * - idChamp   : clé primaire du modèle dans la DB
 * - ownerChamp: champ qui référence le propriétaire
 */
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

/**
 * Middleware générique de vérification d'ownership.
 *
 * Usage dans une route :
 *   router.put('/:id', authentifier, isOwner('projet'), controller.update);
 *
 * L'ADMINISTRATEUR bypasse automatiquement la vérification.
 *
 * @param {string} nomModele - Clé dans MODELES_CONFIG
 * @param {Object} options
 * @param {boolean} [options.allowAdmin=true] - Autoriser l'ADMINISTRATEUR à bypasser
 */
const isOwner = (nomModele, options = {}) => {
  const { allowAdmin = true } = options;

  return async (req, res, next) => {
    try {
      // req.utilisateur doit être peuplé par le middleware authentifier
      if (!req.utilisateur) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
        });
      }

      // L'admin bypass la vérification d'ownership
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

      const idRessource = BigInt(req.params[config.idParam]);
      if (!idRessource) {
        return res.status(400).json({
          success: false,
          message: `Paramètre "${config.idParam}" manquant ou invalide`,
        });
      }

      // Récupérer uniquement le champ owner pour limiter la requête
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

      const idProprietaire = ressource[config.ownerChamp];
      const idUtilisateur = req.utilisateur.id_utilisateur;

      if (idProprietaire !== idUtilisateur) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé : vous n\'êtes pas propriétaire de cette ressource',
        });
      }

      next();
    } catch (erreur) {
      // BigInt() peut lever une erreur si le param n'est pas un nombre valide
      if (erreur instanceof SyntaxError || erreur.message?.includes('Cannot convert')) {
        return res.status(400).json({
          success: false,
          message: 'Identifiant de ressource invalide',
        });
      }
      console.error('[isOwner]', erreur);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification des droits',
      });
    }
  };
};

module.exports = { isOwner, MODELES_CONFIG };