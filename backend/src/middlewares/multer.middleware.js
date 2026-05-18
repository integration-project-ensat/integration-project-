const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ValidationError } = require('../config/errors');

// Types MIME autorisés
const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSIONS_AUTORISEES = ['.jpg', '.jpeg', '.png', '.webp'];

// Taille max : 5 MB
const TAILLE_MAX = 5 * 1024 * 1024;


const MAGIC_BYTES = [
  { bytes: [0xff, 0xd8, 0xff], type: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], type: 'image/png' },
  { bytes: [0x52, 0x49, 0x46, 0x46], type: 'image/webp' }, // RIFF header
];

const verifierMagicBytes = (filePath) => {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    for (const magic of MAGIC_BYTES) {
      const match = magic.bytes.every((byte, i) => buffer[i] === byte);
      if (match) return true;
    }
    return false;
  } catch {
    return false;
  }
};


const creerDossier = (dossier) => {
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'general';
    const dossier = path.join(process.cwd(), 'uploads', type);
    creerDossier(dossier);
    cb(null, dossier);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const idUtilisateur = req.utilisateur?.id_utilisateur || 'anonymous';
    const nomFichier = `${idUtilisateur}_${timestamp}${extension}`;
    cb(null, nomFichier);
  },
});


const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !MIME_AUTORISES.includes(file.mimetype) ||
    !EXTENSIONS_AUTORISEES.includes(extension)
  ) {
    return cb(new ValidationError('Format non autorisé. Formats acceptés : JPG, PNG, WEBP'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: TAILLE_MAX,
    fields: 10,           // max 10 champs non-fichier
    fieldNameSize: 100,   // max 100 chars pour le nom d'un champ
    headerPairs: 100,     // max 100 paires header HTTP
  },
});

const gererErreurMulter = (err, maxFichiers, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new ValidationError('Fichier trop volumineux. Taille max : 5 MB'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new ValidationError(`Trop de fichiers. Max : ${maxFichiers}`));
      case 'LIMIT_FIELD_COUNT':
        return next(new ValidationError('Trop de champs dans la requête'));
      case 'LIMIT_FIELD_KEY':
        return next(new ValidationError('Nom de champ trop long'));
      default:
        return next(new ValidationError("Erreur lors de l'upload du fichier"));
    }
  }
  if (err) return next(err);
};

/**
 * @param {string} champ      - Nom du champ dans le formulaire 
 * @param {string} uploadType - Sous-dossier de destination 
 */
const multerMiddleware = (champ, uploadType = 'general') => {
  return (req, res, next) => {
    req.uploadType = uploadType;

    upload.single(champ)(req, res, (err) => {
      if (err) return gererErreurMulter(err, 1, next);

      if (req.file) {
        const estValide = verifierMagicBytes(req.file.path);
        if (!estValide) {
          fs.unlinkSync(req.file.path); // Supprimer le fichier malveillant
          return next(new ValidationError('Contenu du fichier invalide'));
        }
      }

      next();
    });
  };
};

/**
 * @param {string} champ       - Nom du champ dans le formulaire
 * @param {string} uploadType  - Sous-dossier de destination
 * @param {number} maxFichiers - Nombre max de fichiers 
 */
const multerMultiple = (champ, uploadType = 'general', maxFichiers = 10) => {
  return (req, res, next) => {
    req.uploadType = uploadType;

    upload.array(champ, maxFichiers)(req, res, (err) => {
      if (err) return gererErreurMulter(err, maxFichiers, next);

      // FIX 1 — Vérification magic bytes pour chaque fichier uploadé
      if (req.files?.length) {
        for (const file of req.files) {
          const estValide = verifierMagicBytes(file.path);
          if (!estValide) {
            // Supprimer tous les fichiers uploadés dans cette requête
            req.files.forEach(f => {
              try { fs.unlinkSync(f.path); } catch {}
            });
            return next(new ValidationError('Un ou plusieurs fichiers ont un contenu invalide'));
          }
        }
      }

      next();
    });
  };
};

module.exports = { multerMiddleware, multerMultiple };