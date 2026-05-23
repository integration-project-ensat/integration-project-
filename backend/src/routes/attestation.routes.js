const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const attestationController = require('../controllers/attestation.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const attestationValidator = require('../validators/attestation.validator')

// Config upload attestation
const uploadDir = path.resolve(__dirname, '../../uploads/attestations')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const uploadAttestation = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `attestation-${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format non supporté. PDF, JPEG ou PNG acceptés'))
  }
})

router.use(authentifier)

// CRUD
router.get('/', attestationController.getAll)
router.get('/:id', validate(attestationValidator.idParamRules), attestationController.getOne)

router.post('/',
  autoriserRoles('ETUDIANT'),
  uploadAttestation.single('fichier'),
  validate(attestationValidator.creerRules),
  attestationController.create
)

router.patch('/:id',
  autoriserRoles('ETUDIANT'),
  validate(attestationValidator.modifierRules),
  attestationController.update
)

router.delete('/:id',
  autoriserRoles('ETUDIANT', 'ADMINISTRATEUR'),
  validate(attestationValidator.idParamRules),
  attestationController.delete
)

// Validation
router.patch('/:id/statut',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(attestationValidator.changerStatutRules),
  attestationController.changerStatut
)

// Historique
router.get('/:id/historique',
  validate(attestationValidator.idParamRules),
  attestationController.getHistorique
)

module.exports = router