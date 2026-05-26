const { body, param } = require('express-validator')

const statutValidationRules = [
  param('id').isInt({ min: 1 }).withMessage('ID commentaire invalide'),
  body('motif_refus').optional().isString().withMessage('Motif invalide'),
]

module.exports = {
  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID commentaire invalide'),
  ],

  creerRules: [
    body('contenu').trim().notEmpty().withMessage('Le contenu est requis'),
    body('id_portfolio').optional().isInt({ min: 1 }).withMessage('ID portfolio invalide'),
    body('id_poste').optional().isInt({ min: 1 }).withMessage('ID poste invalide'),
    body().custom((value) => {
      if (!value.id_portfolio && !value.id_poste) {
        throw new Error('Un portfolio ou un poste est requis')
      }
      if (value.id_portfolio && value.id_poste) {
        throw new Error('Choisissez seulement un portfolio ou un poste')
      }
      return true
    }),
  ],

  statutValidationRules,
}
