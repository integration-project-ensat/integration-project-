const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const activiteController = require('../controllers/activite.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const activiteValidator = require('../validators/activite.validator')

// Config upload justificatif
const uploadDir = path.resolve(__dirname, '../../uploads/justificatifs')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const uploadJustificatif = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `justificatif-${Date.now()}${path.extname(file.originalname)}`)
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
router.get('/', activiteController.getAll)
router.get('/:id', validate(activiteValidator.idParamRules), activiteController.getOne)

router.post('/',
  autoriserRoles('ETUDIANT'),
  validate(activiteValidator.creerRules),
  activiteController.create
)

router.patch('/:id',
  autoriserRoles('ETUDIANT'),
  validate(activiteValidator.modifierRules),
  activiteController.update
)

router.delete('/:id',
  autoriserRoles('ETUDIANT', 'ADMINISTRATEUR'),
  validate(activiteValidator.idParamRules),
  activiteController.delete
)

// Upload justificatif
router.post('/:id/justificatif',
  autoriserRoles('ETUDIANT'),
  validate(activiteValidator.idParamRules),
  uploadJustificatif.single('justificatif'),
  activiteController.uploadJustificatif
)

// Validation
router.patch('/:id/valider',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(activiteValidator.changerStatutRules),
  activiteController.valider
)

module.exports = router