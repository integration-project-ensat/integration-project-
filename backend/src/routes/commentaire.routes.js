const express = require('express')
const router = express.Router()

const commentaireController = require('../controllers/commentaire.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const commentaireValidator = require('../validators/commentaire.validator')

router.use(authentifier)

router.get('/', commentaireController.getAll)
router.post('/', validate(commentaireValidator.creerRules), commentaireController.create)

router.patch(
  '/:id/valider',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(commentaireValidator.idParamRules),
  commentaireController.valider,
)

router.patch(
  '/:id/refuser',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(commentaireValidator.statutValidationRules),
  commentaireController.refuser,
)

router.get(
  '/:id/historique',
  validate(commentaireValidator.idParamRules),
  commentaireController.getHistorique,
)

module.exports = router
