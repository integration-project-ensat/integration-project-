const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ValidationError } = require('../config/errors');

// Types MIME autorisés
const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSIONS_AUTORISEES = ['.jpg', '.jpeg', '.png', '.webp'];

// Taille max : 5 MB
const TAILLE_MAX = 5 * 1024 * 1024;

/**
 * Crée le dossier de destination s'il n'existe pas
 */
const creerDossier = (dossier) => {
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
};

/**
 * Configuration du stockage Multer
 * Les fichiers sont organisés par type : uploads/profils/, uploads/projets/, etc.
 */
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
    // Format : userId_timestamp.ext  ex: 42_1715432100000.jpg
    const nomFichier = `${idUtilisateur}_${timestamp}${extension}`;
    cb(null, nomFichier);
  },
});

/**
 * Filtre de validation des fichiers
 */
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !MIME_AUTORISES.includes(file.mimetype) ||
    !EXTENSIONS_AUTORISEES.includes(extension)
  ) {
    return cb(
      new ValidationError(
        `Format non autorisé. Formats acceptés : JPG, PNG, WEBP`
      ),
      false
    );
  }

  cb(null, true);
};

/**
 * Instance Multer de base
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: TAILLE_MAX,
  },
});

/**
 * Middleware générique pour un seul fichier.
 *
 * @param {string} champ      - Nom du champ dans le formulaire (ex: 'photo')
 * @param {string} uploadType - Sous-dossier de destination (ex: 'profils', 'projets')
 *
 * Usage :
 *   router.post('/photo', authentifier, multerMiddleware('photo', 'profils'), controller.uploadPhoto);
 */
const multerMiddleware = (champ, uploadType = 'general') => {
  return (req, res, next) => {
    req.uploadType = uploadType;

    upload.single(champ)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError(`Fichier trop volumineux. Taille max : 5 MB`));
        }
        return next(new ValidationError(`Erreur upload : ${err.message}`));
      }
      if (err) return next(err);
      next();
    });
  };
};

/**
 * Middleware pour upload multiple (max 10 fichiers).
 *
 * @param {string} champ      - Nom du champ dans le formulaire
 * @param {string} uploadType - Sous-dossier de destination
 * @param {number} maxFichiers - Nombre max de fichiers (défaut: 10)
 *
 * Usage :
 *   router.post('/captures', authentifier, multerMultiple('captures', 'projets', 5), controller.uploadCaptures);
 */
const multerMultiple = (champ, uploadType = 'general', maxFichiers = 10) => {
  return (req, res, next) => {
    req.uploadType = uploadType;

    upload.array(champ, maxFichiers)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError(`Fichier trop volumineux. Taille max : 5 MB`));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ValidationError(`Trop de fichiers. Max : ${maxFichiers}`));
        }
        return next(new ValidationError(`Erreur upload : ${err.message}`));
      }
      if (err) return next(err);
      next();
    });
  };
};

module.exports = { multerMiddleware, multerMultiple };