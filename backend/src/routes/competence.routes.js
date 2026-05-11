const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');

const competenceController = require('../controllers/competence.controller');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { isRole } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate');
const { ROLES } = require('../config/roles');

//PUBLIC — Catalogue des compétences

// GET /competences — Liste toutes les compétences
router.get('/', competenceController.getAllCompetences);

// GET /competences/par-type — Compétences groupées par type
router.get('/par-type', competenceController.getCompetencesByType);

// GET /competences/:id — Détail d'une compétence
router.get(
  '/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('ID compétence invalide')]),
  competenceController.getCompetenceById
);


// PROTÉGÉES — Compétences de l'étudiant 

// GET /competences/moi — Compétences de l'utilisateur connecté
router.get(
  '/moi/liste',
  authentifier,
  competenceController.getUserCompetences
);

// GET /competences/moi/suggestions — Suggestions personnalisées
router.get(
  '/moi/suggestions',
  authentifier,
  competenceController.getUserSuggestions
);

// POST /competences/moi — Ajouter une compétence au profil
router.post(
  '/moi',
  authentifier,
  validate([
    body('id_competence').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau doit être entre 0 et 100'),
  ]),
  competenceController.addUserCompetence
);

// POST /competences/moi/bulk — Ajouter plusieurs compétences en une fois
router.post(
  '/moi/bulk',
  authentifier,
  validate([
    body('competences').isArray({ min: 1 }).withMessage('La liste des compétences est requise'),
    body('competences.*.id_competence').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('competences.*.niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau doit être entre 0 et 100'),
  ]),
  competenceController.addBulkUserCompetences
);

// PATCH /competences/moi/:id — Mettre à jour une compétence du profil
router.patch(
  '/moi/:id',
  authentifier,
  validate([
    param('id').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau doit être entre 0 et 100'),
  ]),
  competenceController.updateUserCompetence
);

// DELETE /competences/moi/:id — Supprimer une compétence du profil
router.delete(
  '/moi/:id',
  authentifier,
  validate([param('id').isInt({ min: 1 }).withMessage('ID compétence invalide')]),
  competenceController.removeUserCompetence
);


//ADMIN — Gestion du catalogue

// GET /competences/admin/etudiant/:etudiantId/suggestions — Suggestions pour un étudiant spécifique
router.get(
  '/admin/etudiant/:etudiantId/suggestions',
  authentifier,
  autoriserRoles(ROLES.ADMINISTATEUR),
  validate([param('etudiantId').isInt({ min: 1 }).withMessage('ID étudiant invalide')]),
  competenceController.getSuggestionsForEtudiant
);

// POST /competences/admin — Ajouter une compétence au catalogue
router.post(
  '/admin',
  authentifier,
  autoriserRoles(ROLES.ADMINISTATEUR),
  validate([
    body('nom').notEmpty().withMessage('Le nom de la compétence est requis'),
    body('categorie').optional().isIn(['TECHNIQUE', 'SOFT']).withMessage('Catégorie invalide'),
    body('niveau').optional().isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']).withMessage('Niveau invalide'),
  ]),
  competenceController.createCompetence
);

// PATCH /competences/admin/:id — Modifier une compétence du catalogue
router.patch(
  '/admin/:id',
  authentifier,
  autoriserRoles(ROLES.ADMINISTATEUR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('categorie').optional().isIn(['TECHNIQUE', 'SOFT']).withMessage('Catégorie invalide'),
    body('niveau').optional().isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']).withMessage('Niveau invalide'),
  ]),
  competenceController.updateCompetence
);

// DELETE /competences/admin/:id — Supprimer une compétence du catalogue
router.delete(
  '/admin/:id',
  authentifier,
  autoriserRoles(ROLES.ADMINISTATEUR),
  validate([param('id').isInt({ min: 1 }).withMessage('ID compétence invalide')]),
  competenceController.deleteCompetence
);

module.exports = router;