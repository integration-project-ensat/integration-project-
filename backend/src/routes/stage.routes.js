const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const stageController = require('../controllers/stage.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate')
const stageValidator = require('../validators/stage.validator')

// Config upload rapport PDF
const uploadDir = path.resolve(__dirname, '../../uploads/rapports')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const uploadRapport = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `rapport-${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Seuls les fichiers PDF sont acceptés'))
  }
})

router.use(authentifier)

// CRUD
router.get('/', stageController.getAll)
router.get('/:id', validate(stageValidator.idParamRules), stageController.getOne)

router.post('/',
  autoriserRoles('ETUDIANT'),
  validate(stageValidator.creerRules),
  stageController.create
)

router.patch('/:id',
  autoriserRoles('ETUDIANT'),
  validate(stageValidator.modifierRules),
  stageController.update
)

router.delete('/:id',
  autoriserRoles('ETUDIANT', 'ADMINISTRATEUR'),
  validate(stageValidator.idParamRules),
  stageController.delete
)

// Upload rapport
router.post('/:id/rapport',
  autoriserRoles('ETUDIANT'),
  validate(stageValidator.idParamRules),
  uploadRapport.single('rapport'),
  stageController.uploadRapport
)

// Validation
router.patch('/:id/statut',
  autoriserRoles('PROFESSEUR', 'ADMINISTRATEUR'),
  validate(stageValidator.changerStatutRules),
  stageController.changerStatut
)

// Historique
router.get('/:id/historique',
  validate(stageValidator.idParamRules),
  stageController.getHistorique
)

module.exports = router