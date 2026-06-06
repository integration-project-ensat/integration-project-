// src/routes/admin.routes.js

const express = require('express');
const router = express.Router();
const { query, param, body } = require('express-validator');
const validate = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');
const adminController = require('../controllers/admin.controller');

// Tous les endpoints admin nécessitent authentification + rôle ADMINISTRATEUR
router.use(authentifier, autoriserRoles(ROLES.ADMINISTRATEUR));

// ── Validation réutilisable pour les filtres étudiants ──────
const filtresEtudiants = [
  query('recherche').optional().isString().trim().isLength({ max: 100 }),
  query('ville').optional().isString().trim().isLength({ max: 100 }),
  query('etablissement').optional().isString().trim().isLength({ max: 200 }),
  query('scoreMin')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('scoreMin doit être entre 0 et 100'),
  query('statut')
    .optional()
    .isIn(['verifie', 'en_attente', 'non_verifie'])
    .withMessage('statut invalide'),
];

// ==================== DASHBOARD ====================

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// ==================== ÉTUDIANTS ====================

// GET /api/admin/etudiants
router.get(
  '/etudiants',
  validate(filtresEtudiants),
  adminController.getEtudiants
);

// GET /api/admin/etudiants/export-csv  (avant /:id pour ne pas être capturé)
router.get(
  '/etudiants/export-csv',
  validate(filtresEtudiants),
  adminController.exportEtudiantsCSV
);

// POST /api/admin/etudiants/verification-groupee
router.post(
  '/etudiants/verification-groupee',
  validate([
    body('ids')
      .isArray({ min: 1, max: 50 })
      .withMessage('ids doit être un tableau de 1 à 50 éléments'),
    body('ids.*')
      .isInt({ min: 1 })
      .withMessage('Chaque id doit être un entier positif'),
  ]),
  adminController.verificationGroupee
);

// GET /api/admin/etudiants/:id
router.get(
  '/etudiants/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('ID invalide').toInt()]),
  adminController.getEtudiantDetail
);

router.get('/portfolios', adminController.getPortfolios)

// router.get(
//   '/portfolios/:id',
//   adminController.getPortfolioDetail
// )

// router.delete(
//   '/portfolios/:id',
//   adminController.deletePortfolio
// )

// ==================== LISTES POUR FILTRES ====================

// GET /api/admin/etablissements  — alimente le <select> Établissement
router.get('/etablissements', adminController.getEtablissements);

router.get(
  '/professionnels',
  adminController.getProfessionnels
)

router.get(
  '/professeurs',
  adminController.getProfesseurs
)
router.delete(
  '/professeurs/:id',
  validate([
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID invalide')
      .toInt()
  ]),
  adminController.deleteProfesseur
)
router.patch(
  '/professionnels/:id/valider',
  adminController.validateProfessionnel
)
router.delete(
  '/etudiants/:id',
  validate([
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID invalide')
      .toInt()
  ]),
  adminController.deleteEtudiant
)
router.patch(
  '/professionnels/:id/refuser',
  adminController.rejectProfessionnel
)
router.delete(
  '/professionnels/:id',
  validate([
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID invalide')
      .toInt()
  ]),
  adminController.deleteProfessionnel
)
// GET /api/admin/villes           — alimente le <select> Ville
router.get('/villes', adminController.getVilles);

router.get('/admins', adminController.getAdmins)

router.delete(
  '/admins/:id',
  validate([
    param('id').isInt({ min: 1 }).withMessage('ID invalide').toInt()
  ]),
  adminController.deleteAdmin
)

module.exports = router;