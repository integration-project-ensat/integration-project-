const express = require('express');
const router  = express.Router();
const { param } = require('express-validator');

const profilController = require('../controllers/profil.controller');
const { ProfilValidator } = require('../validators/profil.validator');
const validate        = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const isOwnerProfil   = require('../middlewares/isOwnerProfil');

router.get('/public', profilController.explorerProfils);

router.use(authentifier);

// ─── Validation ID réutilisable ───────────────
const validerId = [
  param('id')
    .notEmpty().withMessage('ID manquant').bail()
    .isInt({ min: 1 }).withMessage('ID invalide').bail()
    .toInt()
];

// ─── Explorer (tous les rôles authentifiés) ───
// GET /profil?search=&filiere=&ville=&competences=&score=&page=&limit=
router.get('/', profilController.explorerProfils);

// ─── Sauvegardes — AVANT /:id ─────────────────
// GET    /profil/saved
router.get(
  '/saved',
  autoriserRoles('PROFESSIONNEL'),
  profilController.getMesSauvegardes
);

// ─── Routes /me ───────────────────────────────
router.get('/me', profilController.getMonProfil);

router.put(
  '/me',
  validate(ProfilValidator.mettreAJour),
  profilController.mettreAJourMonProfil
);

// ─── Routes /:id ──────────────────────────────
// POST   /profil/:id/save
router.post(
  '/:id/save',
  validate(validerId),
  autoriserRoles('PROFESSIONNEL'),
  profilController.sauvegarderProfil
);

// DELETE /profil/:id/save
router.delete(
  '/:id/save',
  validate(validerId),
  autoriserRoles('PROFESSIONNEL'),
  profilController.supprimerSauvegarde
);

// PUT /profil/:id
router.put(
  '/:id',
  validate(validerId),
  isOwnerProfil,
  validate(ProfilValidator.mettreAJour),
  profilController.updateProfilParId
);

// GET /profil/:id
router.get(
  '/:id',
  validate(validerId),
  profilController.getProfilParId
);

module.exports = router;
