const express = require('express')

const connexionController = require('../controllers/connexion.controller')
const { authentifier } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const connexionValidator = require('../validators/connexion.validator')

const router = express.Router()

router.use(authentifier)

router.get('/', connexionController.getMine)
router.post('/', validate(connexionValidator.creerRules), connexionController.create)
router.patch('/:id/accepter', validate(connexionValidator.idParamRules), connexionController.accepter)
router.patch('/:id/refuser', validate(connexionValidator.idParamRules), connexionController.refuser)

module.exports = router
