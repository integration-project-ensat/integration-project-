const { body, param } = require('express-validator');

const BadgeValidator = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID badge invalide')
      .toInt()
  ],

  creer: [
    body('nom')
      .notEmpty().withMessage('Nom requis')
      .isLength({ max: 100 }).withMessage('Nom trop long')
      .trim(),

    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('Description trop longue')
      .trim(),

    body('icone_url')
      .optional()
      .isURL().withMessage('URL icône invalide')
      .isLength({ max: 500 }).withMessage('URL trop longue'),

    body('critere_type')
      .notEmpty().withMessage('Critère requis')
      .isIn(['WEB_DEV', 'DEVOPS', 'DATA', 'SECURITE', 'HACKATHON', 'COLLAB'])
      .withMessage('Critère invalide'),

    body('est_visible')
      .optional()
      .isBoolean().withMessage('est_visible doit être booléen'),

    body('mis_en_avant')
      .optional()
      .isBoolean().withMessage('mis_en_avant doit être booléen')
  ],

  modifier: [
    body('nom')
      .optional()
      .isLength({ max: 100 }).withMessage('Nom trop long')
      .trim(),

    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('Description trop longue')
      .trim(),

    body('icone_url')
      .optional()
      .isURL().withMessage('URL icône invalide')
      .isLength({ max: 500 }).withMessage('URL trop longue'),

    body('critere_type')
      .optional()
      .isIn(['WEB_DEV', 'DEVOPS', 'DATA', 'SECURITE', 'HACKATHON', 'COLLAB'])
      .withMessage('Critère invalide'),

    body('est_visible')
      .optional()
      .isBoolean().withMessage('est_visible doit être booléen'),

    body('mis_en_avant')
      .optional()
      .isBoolean().withMessage('mis_en_avant doit être booléen')
  ]
};

module.exports = { BadgeValidator };