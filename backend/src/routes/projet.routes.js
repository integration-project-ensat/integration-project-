const express = require('express')
const router = express.Router()

const projetController = require('../controllers/projet.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const projetValidator = require('../validators/projet.validator')

router.use(authentifier)

// CRUD
router.get('/', projetController.getAll)
router.get('/:id', validate(projetValidator.idParamRules), projetController.getOne)

router.post('/',
  autoriserRoles('ETUDIANT'),
  validate(projetValidator.creerRules),
  projetController.create
)

router.patch('/:id',
  autoriserRoles('ETUDIANT'),
  validate(projetValidator.modifierRules),
  projetController.update
)

router.delete('/:id',
  autoriserRoles('ETUDIANT', 'ADMINISTRATEUR'),
  validate(projetValidator.idParamRules),
  projetController.delete
)

// Workflow
router.post('/:id/soumettre',
  autoriserRoles('ETUDIANT'),
  validate(projetValidator.idParamRules),
  projetController.soumettre
)

router.patch('/:id/statut',
  autoriserRoles('PROFESSEUR', 'PROFESSIONNEL', 'ADMINISTRATEUR'),
  validate(projetValidator.changerStatutRules),
  projetController.changerStatut
)

// Historique
router.get('/:id/historique',
  validate(projetValidator.idParamRules),
  projetController.getHistorique
)

module.exports = router