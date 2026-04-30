const express = require('express');
const router = express.Router();
const{param} = require('express-validator');

const authController = require('../controllers/auth.controller');
const { AuthValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// === PUBLIC ===
router.post('/sinscrire', validate(AuthValidator.register), authController.register);
router.post('/seconnecter', validate(AuthValidator.login), authController.login);

//  vérification par code (POST avec body)
router.post('/verifier-code', validate(AuthValidator.verifierCode), authController.verifierCode);
router.post('/renvoyer-code', validate(AuthValidator.renvoyerCode), authController.renvoyerCode);

// === PROTÉGÉES ===
router.get('/profil', authentifier, authController.getCurrentUser);

// === ADMIN ===
router.post(
  '/admin/creer',
  authentifier,
  validate(AuthValidator.createAdmin),
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(AuthValidator.createAdmin),
  authController.createAdmin
);

router.patch(
  '/admin/valider/:utilisateurId',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate([param('utilisateurId').isInt({min: 1}).withMessage('ID utilisateur invalide')]),
  authController.validerProfessionnel
);

router.get(
  '/admin/professionnels-en-attente',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(AuthValidator.getProfessionnelsEnAttente),
  authController.getProfessionnelsEnAttente
);

module.exports = router;