const { body, param } = require('express-validator')

const attestationValidator = {
  creerRules: [
    body('titre').notEmpty().withMessage('Le titre est requis'),
    body('type').optional().isString(),
    body('date').optional().isDate().withMessage('Date invalide'),
    body('organisme').optional().isString(),
    body('description').optional().isString(),
  ],

  modifierRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('titre').optional().notEmpty().withMessage('Le titre ne peut pas être vide'),
    body('type').optional().isString(),
    body('date').optional().isDate().withMessage('Date invalide'),
    body('organisme').optional().isString(),
    body('description').optional().isString(),
  ],

  changerStatutRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('statut').isIn(['EN_ATTENTE','VALIDE','REFUSE','CORRECTION_DEMANDEE']).withMessage('Statut invalide'),
    body('motif_refus').optional().isString(),
  ],

  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ]
}

module.exports = attestationValidator