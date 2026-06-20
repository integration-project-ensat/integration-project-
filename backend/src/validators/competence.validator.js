const { body, param } = require('express-validator');

// ─── ADMIN : créer une compétence catalogue ───────────────────────────────────
const createCompetence = [
  body('nom')
    .trim().notEmpty().withMessage('Le nom est requis')
    .isLength({ max: 100 }).withMessage('Max 100 caractères'),

  body('categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide'),
];

// ─── ADMIN : modifier une compétence catalogue ───────────────────────────────
const updateCompetence = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Max 100 caractères'),

  body('categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide'),
];

// ─── ÉTUDIANT : ajouter une compétence au profil ─────────────────────────────
const addUserCompetence = [
  body('id_competence')
    .notEmpty().withMessage('id_competence est requis')
    .isInt({ min: 1 }).withMessage('id_competence doit être un entier positif'),

  body('niveau_maitrise')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('niveau_maitrise doit être entre 0 et 100'),
];

// ─── ÉTUDIANT : ajout en masse ────────────────────────────────────────────────
const bulkUserCompetences = [
  body('competences')
    .isArray({ min: 1 }).withMessage('competences doit être un tableau non vide'),

  body('competences.*.id_competence')
    .notEmpty().withMessage('id_competence est requis')
    .isInt({ min: 1 }).withMessage('id_competence invalide'),

  body('competences.*.niveau_maitrise')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('niveau_maitrise doit être entre 0 et 100'),
];

// ─── ÉTUDIANT : modifier niveau d'une compétence ─────────────────────────────
const updateUserCompetence = [
  body('niveau_maitrise')
    .notEmpty().withMessage('niveau_maitrise est requis')
    .isInt({ min: 0, max: 100 })
    .withMessage('niveau_maitrise doit être entre 0 et 100'),
];

// ─── PARAM : etudiantId ───────────────────────────────────────────────────────
const etudiantIdParam = [
  param('etudiantId')
    .notEmpty()
    .isInt({ min: 1 }).withMessage('etudiantId invalide'),
];

module.exports = {
  createCompetence,
  updateCompetence,
  addUserCompetence,
  bulkUserCompetences,
  updateUserCompetence,
  etudiantIdParam,
};