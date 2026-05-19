const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { multerFileFilter, MAX_SIZE_BYTES } = require('../validators/photo.validator');

const UPLOAD_DIR = path.resolve(__dirname, '../uploads/photos');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer stocke en mémoire (buffer) — sharp s'occupe de sauvegarder
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: multerFileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

/**
 * Middleware : resize + sauvegarde avec sharp
 * Doit être utilisé APRÈS upload.single('photo')
 */
async function processAndSavePhoto(req, res, next) {
  if (!req.file) return next();

  try {
    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    req.photoPath = `/uploads/photos/${filename}`;
    req.photoFilename = filename;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, processAndSavePhoto };
