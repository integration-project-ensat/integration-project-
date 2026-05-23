const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');

const competenceController = require('../controllers/competence.controller');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { ROLES } = require('../config/roles');

// === PUBLIC — Catalogue des compétences ===

router.get('/', competenceController.getAllCompetences);
router.get('/par-type', competenceController.getCompetencesByType);
router.get(
  '/suggestions/:etudiantId',
  validate([param('etudiantId').isInt({ min: 1 }).withMessage('ID étudiant invalide')]),
  competenceController.getSuggestionsForEtudiant
);
router.get(
  '/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('ID compétence invalide')]),
  competenceController.getCompetenceById
);

// === PROTÉGÉES — Compétences de l'étudiant ===

const etudiantOnly = [authentifier, autoriserRoles('ETUDIANT')];

router.get('/moi/liste', authentifier, competenceController.getUserCompetences);
router.get('/moi/suggestions', authentifier, competenceController.getUserSuggestions);
router.post('/moi', ...etudiantOnly,
  validate([
    body('id_competence').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau doit être entre 0 et 100'),
  ]),
  competenceController.addUserCompetence
);
router.post('/moi/bulk', ...etudiantOnly,
  validate([
    body('competences').isArray({ min: 1 }).withMessage('La liste des compétences est requise'),
    body('competences.*.id_competence').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('competences.*.niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau invalide'),
  ]),
  competenceController.addBulkUserCompetences
);
router.patch('/moi/:id', ...etudiantOnly,
  validate([
    param('id').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau doit être entre 0 et 100'),
  ]),
  competenceController.updateUserCompetence
);
router.delete('/moi/:id', ...etudiantOnly,
  validate([param('id').isInt({ min: 1 }).withMessage('ID compétence invalide')]),
  competenceController.removeUserCompetence
);

// === ADMIN — Gestion du catalogue ===

router.post('/admin', authentifier, autoriserRoles(ROLES.ADMINISTATEUR),
  validate([
    body('nom').notEmpty().withMessage('Le nom de la compétence est requis'),
    body('categorie').optional().isIn(['TECHNIQUE', 'SOFT']).withMessage('Catégorie invalide'),
    body('niveau').optional().isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']).withMessage('Niveau invalide'),
  ]),
  competenceController.createCompetence
);
router.patch('/admin/:id', authentifier, autoriserRoles(ROLES.ADMINISTATEUR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('categorie').optional().isIn(['TECHNIQUE', 'SOFT']).withMessage('Catégorie invalide'),
    body('niveau').optional().isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']).withMessage('Niveau invalide'),
  ]),
  competenceController.updateCompetence
);
router.delete('/admin/:id', authentifier, autoriserRoles(ROLES.ADMINISTATEUR),
  validate([param('id').isInt({ min: 1 }).withMessage('ID compétence invalide')]),
  competenceController.deleteCompetence
);

module.exports = router;
