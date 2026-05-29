const express = require('express');
const router = express.Router();
const { upload, processAndSavePhoto } = require('../middlewares/uploadPhoto');
const { requirePhoto } = require('../validators/photo.validator');
const { uploadPhoto, removePhoto } = require('../controllers/photo.controller');
const { authentifier } = require('../middlewares/auth.middleware');

router.post(
  '/',
  authentifier,
  upload.single('photo'),
  requirePhoto,
  processAndSavePhoto,
  uploadPhoto
);

router.delete('/', authentifier, removePhoto);

module.exports = router;