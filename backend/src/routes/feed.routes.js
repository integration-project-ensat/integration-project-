const express = require('express')

const feedController = require('../controllers/feed.controller')
const { authentifier } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authentifier)

router.get('/', feedController.getFeed)

module.exports = router
