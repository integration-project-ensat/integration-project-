const express = require('express')
const { getCareerRecommendation } = require('../controllers/aiController')

const router = express.Router()

router.post('/career-recommendation', getCareerRecommendation)

module.exports = router
