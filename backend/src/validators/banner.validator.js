const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 8
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function multerFileFilter(req, file, cb) {
  if (FORMATS_ACCEPTES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Format non supporte. Formats acceptes : ${FORMATS_ACCEPTES.join(', ')}`), false)
  }
}

function requireBanner(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Aucune banniere fournie' })
  }
  next()
}

module.exports = { multerFileFilter, MAX_SIZE_BYTES, MAX_SIZE_MB, FORMATS_ACCEPTES, requireBanner }
