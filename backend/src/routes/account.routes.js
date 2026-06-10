const express = require('express')
const accountController = require('../controllers/account.controller')
const { authentifier } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authentifier)

router.get('/me', accountController.me)
router.patch('/email', accountController.updateEmail)
router.patch('/password', accountController.updatePassword)

module.exports = router
