const { body, param } = require('express-validator')

const activiteValidator = {
  creerRules: [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('type').optional().isIn(['CLUB','EVENEMENT','HACKATHON','COMPETITION','ASSOCIATION']).withMessage('Type invalide'),
    body('periode').optional().isString(),
    body('description').optional().isString(),
  ],

  modifierRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('type').optional().isIn(['CLUB','EVENEMENT','HACKATHON','COMPETITION','ASSOCIATION']).withMessage('Type invalide'),
    body('periode').optional().isString(),
    body('description').optional().isString(),
  ],

  changerStatutRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('statut').isIn(['DECLAREE','ATTESTEE_INSTITUTION','REFUSEE']).withMessage('Statut invalide'),
  ],

  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ]
}

module.exports = activiteValidator
