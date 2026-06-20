const express = require('express')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const studentCtrl = require('../controllers/student.controller')

const router = express.Router()

router.use(authentifier)
router.use(autoriserRoles('ETUDIANT'))

router.get('/dashboard', studentCtrl.getDashboard)
router.get('/profile-progress', studentCtrl.getProfileProgress)
router.get('/opportunities', studentCtrl.getOpportunities)
router.get('/professionnels', studentCtrl.getProfessionnels)
router.get('/recent-activity', studentCtrl.getRecentActivity)

module.exports = router
