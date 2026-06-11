const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function multerFileFilter(req, file, cb) {
  if (FORMATS_ACCEPTES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Format non supporté. Formats acceptés : ${FORMATS_ACCEPTES.join(', ')}`), false)
  }
}

function requirePhoto(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Aucune photo fournie' })
  }
  next()
}

module.exports = { multerFileFilter, MAX_SIZE_BYTES, MAX_SIZE_MB, FORMATS_ACCEPTES, requirePhoto }