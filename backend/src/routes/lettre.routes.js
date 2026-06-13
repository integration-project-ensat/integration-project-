const express = require('express')
const router = express.Router()

const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const lettreCtrl = require('../controllers/lettre.controller')

router.post(
  '/lettres',
  authentifier,
  autoriserRoles('ETUDIANT'),
  lettreCtrl.createRequest,
)

// Liste lettres (connecte) - proprietaire voit tout, autres voient les publiques
router.get('/lettres/:id_etudiant', authentifier, lettreCtrl.getLettres)

// Lettres publiques (sans auth)
router.get('/lettres/public/:id_etudiant', lettreCtrl.getLettresPublic)

// Modifier visibilite d'une lettre
router.patch('/lettres/:id_lettre/visibilite', authentifier, lettreCtrl.updateVisibilite)

// Professeur: accepter/refuser/rediger une lettre
router.patch(
  '/lettres/:id_lettre/statut',
  authentifier,
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  lettreCtrl.updateStatut,
)

// Export
router.get('/lettres/:id_lettre/export/pdf', authentifier, lettreCtrl.exportPDF)
router.get('/lettres/:id_lettre/export/html', authentifier, lettreCtrl.exportHTML)

module.exports = router
