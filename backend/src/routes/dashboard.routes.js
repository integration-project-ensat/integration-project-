const express = require('express')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const dashboardCtrl = require('../controllers/dashboard.controller')

const router = express.Router()

router.use(authentifier)

router.get('/prof/dashboard', autoriserRoles('PROFESSEUR'), dashboardCtrl.getProfDashboard)
router.get('/pro/dashboard', autoriserRoles('PROFESSIONNEL'), dashboardCtrl.getProDashboard)

module.exports = router
