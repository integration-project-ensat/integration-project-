const express = require('express')
const router = express.Router()
const { upload, processAndSaveBanner } = require('../middlewares/uploadBanner')
const { requireBanner } = require('../validators/banner.validator')
const { uploadBanner, removeBanner } = require('../controllers/banner.controller')
const { authentifier } = require('../middlewares/auth.middleware')

router.post(
  '/',
  authentifier,
  upload.single('banner'),
  requireBanner,
  processAndSaveBanner,
  uploadBanner
)

router.delete('/', authentifier, removeBanner)

module.exports = router
