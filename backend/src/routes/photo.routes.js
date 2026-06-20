const express = require('express');
const router = express.Router();
const { upload, processAndSavePhoto } = require('../middlewares/uploadPhoto');
const { requirePhoto } = require('../validators/photo.validator');
const { uploadPhoto, removePhoto } = require('../controllers/photo.controller');
const { authentifier } = require('../middlewares/auth.middleware');

function pickUploadedPhoto(req, res, next) {
  const photoFile = req.files?.photo?.[0] || req.files?.avatar?.[0] || null;
  if (photoFile) {
    req.file = photoFile;
  }
  next();
}

router.post(
  '/',
  authentifier,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
  ]),
  pickUploadedPhoto,
  requirePhoto,
  processAndSavePhoto,
  uploadPhoto
);

router.delete('/', authentifier, removePhoto);

module.exports = router;
