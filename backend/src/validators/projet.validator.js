const { body, param } = require('express-validator')

const projetValidator = {
  creerRules: [
    body('titre').notEmpty().withMessage('Le titre est requis'),
    body('description').optional().isString(),
    body('type').optional().isIn(['MODULE','INTEGRATION','HACKATHON','PERSONNEL','STAGE']).withMessage('Type invalide'),
    body('role').optional().isString(),
    body('resultats').optional().isString(),
    body('lien_github').optional().isURL().withMessage('Lien GitHub invalide'),
    body('id_professeur').optional().isInt({ min: 1 }).withMessage('ID professeur invalide'),
  ],

  modifierRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('titre').optional().notEmpty().withMessage('Le titre ne peut pas être vide'),
    body('type').optional().isIn(['MODULE','INTEGRATION','HACKATHON','PERSONNEL','STAGE']).withMessage('Type invalide'),
    body('lien_github').optional().isURL().withMessage('Lien GitHub invalide'),
    body('id_professeur').optional().isInt({ min: 1 }).withMessage('ID professeur invalide'),
  ],

  changerStatutRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('statut').isIn(['EN_ATTENTE','VALIDE','REFUSE','CORRECTION_DEMANDEE']).withMessage('Statut invalide'),
    body('motif_refus').optional().isString(),
    body('appreciation_professeur').optional().isString(),
  ],

  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ]
}

module.exports = projetValidator