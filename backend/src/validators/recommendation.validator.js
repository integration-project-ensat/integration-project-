const { body, param } = require('express-validator')

module.exports = {
  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID recommandation invalide'),
  ],

  creerRules: [
    body('id_etudiant_cible').isInt({ min: 1 }).withMessage('Etudiant cible requis'),
    body('id_portfolio').optional().isInt({ min: 1 }).withMessage('ID portfolio invalide'),
    body('message').optional().isString().withMessage('Message invalide'),
    body('role_auteur')
      .optional()
      .isIn(['ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL'])
      .withMessage('Role auteur invalide'),
  ],

  ajouterPortfolioRules: [
    param('id').isInt({ min: 1 }).withMessage('ID recommandation invalide'),
    body('id_portfolio').isInt({ min: 1 }).withMessage('ID portfolio requis'),
    body('position').optional().isInt({ min: 0 }).withMessage('Position invalide'),
    body('est_affichee').optional().isBoolean().withMessage('Affichage invalide'),
  ],

  refusRules: [
    param('id').isInt({ min: 1 }).withMessage('ID recommandation invalide'),
    body('motif_refus').optional().isString().withMessage('Motif invalide'),
  ],
}
