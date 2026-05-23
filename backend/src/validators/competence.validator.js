const { body, param } = require('express-validator')

const competenceValidator = {
  addCompetenceRules: [
    body('id_competence').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau entre 0 et 100')
  ],

  updateCompetenceRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau entre 0 et 100')
  ],

  bulkAddRules: [
    body('competences').isArray({ min: 1 }).withMessage('Liste requise'),
    body('competences.*.id_competence').isInt({ min: 1 }).withMessage('ID compétence invalide'),
    body('competences.*.niveau_maitrise').optional().isInt({ min: 0, max: 100 }).withMessage('Niveau invalide')
  ],

  createCatalogueRules: [
    body('nom').notEmpty().withMessage('Nom requis'),
    body('categorie').optional().isIn(['TECHNIQUE', 'COMPORTEMENTALE']).withMessage('Catégorie invalide'),
    body('niveau').optional().isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']).withMessage('Niveau invalide')
  ],

  updateCatalogueRules: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
    body('categorie').optional().isIn(['TECHNIQUE', 'COMPORTEMENTALE']).withMessage('Catégorie invalide'),
    body('niveau').optional().isIn(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']).withMessage('Niveau invalide')
  ]
}

module.exports = competenceValidator