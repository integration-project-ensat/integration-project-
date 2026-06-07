const { body, param } = require('express-validator')

const reactionTypes = ['JAIME', 'BRAVO', 'LIKE']

module.exports = {
  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID poste invalide'),
  ],

  creerRules: [
    body('contenu').trim().notEmpty().withMessage('Le contenu est requis'),
    body('visibilite')
      .optional()
      .isIn(['PUBLIC', 'PRIVE', 'ENSEIGNANTS', 'LIEN_PARTAGE'])
      .withMessage('Visibilite invalide'),
    body('collaborateurs').optional().custom((value) => {
      const list = Array.isArray(value) ? value : JSON.parse(value)
      if (!Array.isArray(list) || list.some((id) => !Number.isInteger(Number(id)) || Number(id) < 1)) {
        throw new Error('Collaborateurs invalides')
      }
      return true
    }),
  ],

  modifierRules: [
    param('id').isInt({ min: 1 }).withMessage('ID poste invalide'),
    body('contenu').optional().trim().notEmpty().withMessage('Le contenu ne peut pas etre vide'),
    body('visibilite')
      .optional()
      .isIn(['PUBLIC', 'PRIVE', 'ENSEIGNANTS', 'LIEN_PARTAGE'])
      .withMessage('Visibilite invalide'),
    body('collaborateurs').optional().custom((value) => {
      const list = Array.isArray(value) ? value : JSON.parse(value)
      if (!Array.isArray(list) || list.some((id) => !Number.isInteger(Number(id)) || Number(id) < 1)) {
        throw new Error('Collaborateurs invalides')
      }
      return true
    }),
  ],

  reactionRules: [
    param('id').isInt({ min: 1 }).withMessage('ID poste invalide'),
    body('type').optional().isIn(reactionTypes).withMessage('Reaction invalide'),
  ],

  commentRules: [
    param('id').isInt({ min: 1 }).withMessage('ID poste invalide'),
    body('contenu').trim().notEmpty().withMessage('Le contenu est requis'),
  ],
}
