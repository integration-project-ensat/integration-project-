const express = require('express')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const studentCtrl = require('../controllers/student.controller')

const router = express.Router()

// Toutes les routes nécessitent une authentification et le rôle ETUDIANT
router.use(authentifier)
router.use(autoriserRoles('ETUDIANT'))

// Dashboard étudiant
router.get('/dashboard', studentCtrl.getDashboard)

// Progression du profil
router.get('/profile-progress', studentCtrl.getProfileProgress)

// Opportunités
router.get('/opportunities', studentCtrl.getOpportunities)

// Activité récente
router.get('/recent-activity', studentCtrl.getRecentActivity)

module.exports = router
