// src/routes/diplome.router.js
const express = require('express');
const router  = express.Router();
const { param } = require('express-validator');

const diplomeController               = require('../controllers/diplome.controller');
const { DiplomeValidator }            = require('../validators/diplome.validator');
const validate                        = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { ROLES }                       = require('../config/roles');

router.use(authentifier);

// ─── Routes ETUDIANT uniquement ──────────────

// POST /diplomes — créer un diplôme
router.post(
  '/',
  autoriserRoles(ROLES.ETUDIANT),
  validate(DiplomeValidator.creer),
  diplomeController.creerDiplome
);

// GET /diplomes — lister ses propres diplômes
router.get(
  '/',
  autoriserRoles(ROLES.ETUDIANT),
  diplomeController.getMesDiplomes
);

// PUT /diplomes/:id — modifier un diplôme (ownership vérifié dans le service)
router.put(
  '/:id',
  autoriserRoles(ROLES.ETUDIANT),
  validate(DiplomeValidator.mettreAJour),
  diplomeController.mettreAJourDiplome
);

// DELETE /diplomes/:id — supprimer un diplôme (ownership vérifié dans le service)
router.delete(
  '/:id',
  autoriserRoles(ROLES.ETUDIANT),
  validate(DiplomeValidator.parId),
  diplomeController.supprimerDiplome
);

// ─── Routes PROFESSEUR + ADMINISTRATEUR ──────

// GET /diplomes/etudiant/:etudiantId — diplômes d'un étudiant spécifique
router.get('/etudiant/:etudiantId',
  autoriserRoles(ROLES.PROFESSEUR, ROLES.ADMINISTRATEUR),
  validate([
    param('etudiantId')
      .notEmpty().withMessage('ID étudiant manquant').bail()
      .isInt({ min: 1 }).withMessage('ID étudiant invalide').bail()
      .toInt()
  ]),
  diplomeController.getDiplomesParEtudiant
);

// GET /diplomes/:id — voir un diplôme spécifique
// accessible ETUDIANT (ownership vérifié service) + PROF + ADMIN
router.get(
  '/:id',
  autoriserRoles(ROLES.ETUDIANT, ROLES.PROFESSEUR, ROLES.ADMINISTRATEUR),
  validate(DiplomeValidator.parId),
  diplomeController.getDiplomeParId
);

module.exports = router;