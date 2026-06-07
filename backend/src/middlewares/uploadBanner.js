const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { multerFileFilter, MAX_SIZE_BYTES } = require('../validators/banner.validator')

const UPLOAD_DIR = path.resolve(__dirname, '../uploads/banners')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
})

async function processAndSaveBanner(req, res, next) {
  if (!req.file) return next()

  try {
    const filename = `${uuidv4()}.webp`
    const outputPath = path.join(UPLOAD_DIR, filename)

    await sharp(req.file.buffer)
      .resize(1200, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toFile(outputPath)

    req.bannerPath = `/uploads/banners/${filename}`
    req.bannerFilename = filename

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { upload, processAndSaveBanner }
