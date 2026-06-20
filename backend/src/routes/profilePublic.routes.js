const express = require('express')
const { param } = require('express-validator')

const profilePublicController = require('../controllers/profilePublic.controller')
const { authentifier } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')

const router = express.Router()

router.use(authentifier)

router.get(
  '/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('ID profil invalide')]),
  profilePublicController.getOne,
)

module.exports = router
