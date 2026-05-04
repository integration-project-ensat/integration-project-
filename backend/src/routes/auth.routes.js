const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

const authController = require('../controllers/auth.controller');
const passwordController = require('../controllers/password.controller');
const { AuthValidator } = require('../validators/auth.validator');
const { PasswordValidator } = require('../validators/password.validator');
const validate = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// === PUBLIC ===
router.post('/sinscrire', validate(AuthValidator.register), authController.register);
router.post('/seconnecter', validate(AuthValidator.login), authController.login);

//  vérification par code (POST avec body)
router.post('/verifier-code', validate(AuthValidator.verifierCode), authController.verifierCode);
router.post('/renvoyer-code', validate(AuthValidator.renvoyerCode), authController.renvoyerCode);

//Réinitialisation du mot de passe
router.post('/mot-de-passe-oublie', validate(PasswordValidator.motDePasseOublie), passwordController.motDePasseOublie);

router.get('/verifier-token-reset', validate(PasswordValidator.verifierTokenReset), passwordController.verifierTokenReset);

router.post('/reinitialiser-mot-de-passe', validate(PasswordValidator.reinitialiserMotDePasse), passwordController.reinitialiserMotDePasse);

// === PROTÉGÉES ===
router.get('/profil', authentifier, authController.getCurrentUser);

// === ADMIN ===
router.post(
  '/admin/creer',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(AuthValidator.createAdmin),
  authController.createAdmin
);

router.get(
  '/admin/valider/:utilisateurId',
  validate([
    param('utilisateurId').isInt({ min: 1 }).withMessage('ID invalide'),
    query('token').notEmpty().withMessage('Token manquant')
  ]),
  authController.validerProfessionnelParLien
);

router.get(
  '/admin/refuser/:utilisateurId',
  validate([
    param('utilisateurId').isInt({ min: 1 }).withMessage('ID invalide'),
    query('token').notEmpty().withMessage('Token manquant')
  ]),
  authController.refuserProfessionnelParLien
);
router.get(
  '/admin/professionnels-en-attente',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(AuthValidator.getProfessionnelsEnAttente),
  authController.getProfessionnelsEnAttente
);

module.exports = router;