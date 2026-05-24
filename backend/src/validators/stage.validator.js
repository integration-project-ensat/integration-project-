const { body, param } = require('express-validator')

const stageValidator = {
  creerRules: [
    body('entreprise').notEmpty().withMessage('L\'entreprise est requise'),
    body('poste').optional().isString(),
    body('duree_semaines').optional().isInt({ min: 1 }).withMessage('Durée invalide'),
    body('missions').optional().isString(),
    body('technologies').optional().isString(),
    body('date_debut').optional().isDate().withMessage('Date début invalide'),
    body('date_fin').optional().isDate().withMessage('Date fin invalide'),
    body('id_encadrant').optional().isInt({ min: 1 }).withMessage('ID encadrant invalide'),
  ],

  modifierRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('entreprise').optional().notEmpty().withMessage('L\'entreprise ne peut pas être vide'),
    body('duree_semaines').optional().isInt({ min: 1 }).withMessage('Durée invalide'),
    body('date_debut').optional().isDate().withMessage('Date début invalide'),
    body('date_fin').optional().isDate().withMessage('Date fin invalide'),
    body('id_encadrant').optional().isInt({ min: 1 }).withMessage('ID encadrant invalide'),
  ],

  changerStatutRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('statut').isIn(['EN_ATTENTE','VALIDE','REFUSE','CORRECTION_DEMANDEE']).withMessage('Statut invalide'),
    body('commentaire_prof').optional().isString(),
    body('motif_refus').optional().isString(),
  ],

  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ]
}

module.exports = stageValidator