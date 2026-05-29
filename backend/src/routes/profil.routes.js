// src/routes/profil.router.js
const express = require('express');
const router  = express.Router();
const { param } = require('express-validator');

const profilController = require('../controllers/profil.controller');
const { ProfilValidator } = require('../validators/profil.validator');
const validate        = require('../middlewares/validate');
const { authentifier } = require('../middlewares/auth.middleware');
const isOwnerProfil   = require('../middlewares/isOwnerProfil');

router.use(authentifier);

// ─── Validation ID réutilisable ───────────────
const validerId = [
  param('id')
    .notEmpty().withMessage('ID manquant').bail()
    .isInt({ min: 1 }).withMessage('ID invalide').bail()
    .toInt()
];

// ─── Routes /me (ownership implicite via JWT) ─
// GET  /profil/me — récupérer son propre profil complet
router.get('/me', profilController.getMonProfil);

// PUT  /profil/me — mettre à jour son propre profil
router.put(
  '/me',
  validate(ProfilValidator.mettreAJour),
  profilController.mettreAJourMonProfil
);

// ─── Routes /:id ──────────────────────────────
// PUT /profil/:id — admin ou propriétaire (upsert)
router.put(
  '/:id',
  validate(validerId),
  isOwnerProfil,
  validate(ProfilValidator.mettreAJour),
  profilController.updateProfilParId
);

// GET /profil/:id — voir le profil d'un autre utilisateur
// (déclaré en dernier pour ne pas capturer /me)
router.get(
  '/:id',
  validate(validerId),
  profilController.getProfilParId
);

module.exports = router;