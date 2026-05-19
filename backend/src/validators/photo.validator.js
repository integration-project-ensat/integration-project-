const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Filtre multer — appelé automatiquement par multer avant le stockage
function multerFileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error('Format non supporté. Utilisez JPEG, PNG ou WEBP.'),
      false
    );
  }
  cb(null, true);
}


 // Middleware Express — vérifie qu'un fichier a bien été envoyé

function requirePhoto(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune photo fournie.' });
  }
  next();
}

module.exports = { multerFileFilter, requirePhoto, MAX_SIZE_BYTES };
