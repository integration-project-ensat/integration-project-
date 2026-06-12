const express = require('express')
const multer = require('multer')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const controller = require('../controllers/profStudent.controller')

const router = express.Router()

const csvUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain']
    const isCsvExtension = /\.csv$/i.test(file.originalname || '')

    if (allowedMimeTypes.includes(file.mimetype) || isCsvExtension) {
      return cb(null, true)
    }

    return cb(new Error('Seuls les fichiers CSV sont autorisés'))
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
})

router.use(authentifier, autoriserRoles('PROFESSEUR'))

router.get('/etudiants', controller.listStudents)
router.get('/etudiants/:id/status', controller.getStudentStatus)
router.post('/etudiants', controller.attachStudent)
router.post('/etudiants/import-csv', csvUpload.single('file'), controller.importStudentsCsv)
router.delete('/etudiants/:id', controller.detachStudent)

module.exports = router
