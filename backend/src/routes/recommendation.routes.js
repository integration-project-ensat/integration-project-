const express = require('express')
const router = express.Router()

const recommendationController = require('../controllers/recommendation.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const recommendationValidator = require('../validators/recommendation.validator')

router.use(authentifier)

router.get('/', recommendationController.getAll)
router.get('/compteur', recommendationController.compter)

router.post(
  '/',
  autoriserRoles('PROFESSEUR', 'PROFESSIONNEL'),
  validate(recommendationValidator.creerRules),
  recommendationController.create,
)

router.patch(
  '/:id/valider',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(recommendationValidator.idParamRules),
  recommendationController.valider,
)

router.patch(
  '/:id/refuser',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(recommendationValidator.refusRules),
  recommendationController.refuser,
)

router.post(
  '/:id/portfolio',
  autoriserRoles('ETUDIANT', 'ADMINISTRATEUR'),
  validate(recommendationValidator.ajouterPortfolioRules),
  recommendationController.ajouterAuPortfolio,
)

module.exports = router
