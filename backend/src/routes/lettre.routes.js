const express = require('express')
const router = express.Router()

const { authentifier } = require('../middlewares/auth.middleware')
const lettreCtrl = require('../controllers/lettre.controller')

// Liste lettres (connecté) — propriétaire voit tout, autres voient les publiques
router.get('/lettres/:id_etudiant', authentifier, lettreCtrl.getLettres)

// Lettres publiques (sans auth)
router.get('/lettres/public/:id_etudiant', lettreCtrl.getLettresPublic)

// Modifier visibilité d'une lettre
router.patch('/lettres/:id_lettre/visibilite', authentifier, lettreCtrl.updateVisibilite)

// Export
router.get('/lettres/:id_lettre/export/pdf', authentifier, lettreCtrl.exportPDF)
router.get('/lettres/:id_lettre/export/html', authentifier, lettreCtrl.exportHTML)

module.exports = router
