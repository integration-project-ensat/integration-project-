const { body, param } = require('express-validator');

const etudiantIdParam = [
  param('etudiantId')
    .isInt({ min: 1 })
    .withMessage('ID étudiant invalide')
    .toInt()
];

const addUserCompetence = [
  body('id_competence')
    .isInt({ min: 1 })
    .withMessage('ID compétence invalide'),

  body('niveau_maitrise')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Le niveau doit être entre 0 et 100')
];

const bulkUserCompetences = [
  body('competences')
    .isArray({ min: 1 })
    .withMessage('La liste des compétences est requise'),

  body('competences.*.id_competence')
    .isInt({ min: 1 })
    .withMessage('ID compétence invalide'),

  body('competences.*.niveau_maitrise')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Niveau invalide')
];

const updateUserCompetence = [
  body('niveau_maitrise')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Le niveau doit être entre 0 et 100')
];

const createCompetence = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom de la compétence est requis'),

  body('categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide'),

  body('niveau')
    .optional()
    .isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'])
    .withMessage('Niveau invalide')
];

const updateCompetence = [
  body('nom')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le nom ne peut pas être vide'),

  body('categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide'),

  body('niveau')
    .optional()
    .isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'])
    .withMessage('Niveau invalide')
];

module.exports = {
  etudiantIdParam,
  addUserCompetence,
  bulkUserCompetences,
  updateUserCompetence,
  createCompetence,
  updateCompetence
};