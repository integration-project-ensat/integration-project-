// validators/competenceValidator.js
const { body } = require('express-validator');

const addCompetenceRules = [
  body('nom')
    .trim().escape()
    .notEmpty().withMessage('Le nom de la compétence est obligatoire').bail()
    .isLength({ min: 1, max: 100 }).withMessage('Le nom doit contenir entre 1 et 100 caractères'),

  body('niveau')
    .optional()
    .isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'])
    .withMessage('Niveau invalide. Choix : DEBUTANT, INTERMEDIAIRE, AVANCE, EXPERT'),

  body('categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide. Choix : TECHNIQUE, COMPORTEMENTALE'),
];

const updateCompetenceRules = [
  body('nom')
    .optional()
    .trim().escape()
    .isLength({ min: 1, max: 100 }).withMessage('Le nom doit contenir entre 1 et 100 caractères'),

  body('niveau')
    .optional()
    .isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'])
    .withMessage('Niveau invalide. Choix : DEBUTANT, INTERMEDIAIRE, AVANCE, EXPERT'),

  body('categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide. Choix : TECHNIQUE, COMPORTEMENTALE'),
];

const bulkAddRules = [
  body('competences')
    .isArray({ min: 1 }).withMessage('Au moins une compétence est requise'),
  body('competences.*.nom')
    .trim().escape()
    .notEmpty().withMessage('Le nom de la compétence est obligatoire')
    .isLength({ min: 1, max: 100 }).withMessage('Le nom doit contenir entre 1 et 100 caractères'),
  body('competences.*.niveau')
    .optional()
    .isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'])
    .withMessage('Niveau invalide'),
  body('competences.*.categorie')
    .optional()
    .isIn(['TECHNIQUE', 'COMPORTEMENTALE'])
    .withMessage('Catégorie invalide'),
];

function valider(rules) {
  return async (req, res, next) => {
    const errors = await Promise.all(rules.map(rule => rule.run(req)));
    const validationErrors = errors.filter(error => !error.isEmpty()).map(error => error.array());
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors.flat() });
    }
    next();
  };
}

module.exports = {
  addCompetenceRules,
  updateCompetenceRules,
  bulkAddRules,
  valider,
};