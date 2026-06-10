const express = require('express')
const connexionController = require('../controllers/connexion.controller')
const { authentifier } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const connexionValidator = require('../validators/connexion.validator')

const router = express.Router()

router.use(authentifier)

router.get('/status/:userId', validate(connexionValidator.userId), connexionController.getStatus)
router.post('/:userId', validate(connexionValidator.userId), connexionController.envoyerDemande)
router.patch('/:id/accepter', validate(connexionValidator.idParamRules), connexionController.accepter)
router.patch('/:id/refuser', validate(connexionValidator.idParamRules), connexionController.refuser)
router.get('/', connexionController.getMine)
router.get('/mes-demandes', connexionController.getMesDemandes)
router.get('/recues', connexionController.getDemandesRecues)
router.get('/mes-connexions', connexionController.getMesConnexions)
router.delete('/:id', validate(connexionValidator.idParamRules), connexionController.supprimerConnexion)

module.exports = router
