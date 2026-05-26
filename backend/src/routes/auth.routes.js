const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const passwordController = require('../controllers/password.controller');
const { AuthValidator } = require('../validators/auth.validator');
const { PasswordValidator } = require('../validators/password.validator');
const validate = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// VALIDATION RÉUTILISABLE (liens admin valider/refuser)
const validationLienAdmin = [
  param('utilisateurId')
    .notEmpty().withMessage('ID utilisateur manquant').bail()
    .isInt({ min: 1 }).withMessage('ID invalide').bail()
    .toInt(),
  query('token')
    .notEmpty().withMessage('Token manquant').bail()
    .isLength({ min: 64, max: 64 }).withMessage('Token invalide (64 caractères requis)').bail()
    .matches(/^[a-f0-9]+$/).withMessage('Format invalide (hexadécimal attendu)')
];

// ROUTES PUBLIQUES
router.post('/sinscrire', validate(AuthValidator.register), authController.register);
router.post('/seconnecter', validate(AuthValidator.login), authController.login);
router.post('/verifier-code', validate(AuthValidator.verifierCode), authController.verifierCode);
router.post('/renvoyer-code', validate(AuthValidator.renvoyerCode), authController.renvoyerCode);

// Réinitialisation mot de passe
router.post('/mot-de-passe-oublie', validate(PasswordValidator.motDePasseOublie), passwordController.motDePasseOublie);
router.get('/verifier-token-reset', validate(PasswordValidator.verifierTokenReset), passwordController.verifierTokenReset);
router.post('/reinitialiser-mot-de-passe', validate(PasswordValidator.reinitialiserMotDePasse), passwordController.reinitialiserMotDePasse);

// ROUTES PROTÉGÉES (JWT REQUIS)
router.get('/profil', authentifier, authController.getCurrentUser);
router.get('/me', authentifier, authController.getCurrentUser);

// ROUTES ADMIN (JWT + rôle)
router.post(
  '/admin/creer',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(AuthValidator.createAdmin),
  authController.createAdmin
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  authController.googleCallback
);

router.post(
  '/google/complete-profile',
  authController.completeGoogleSignup
);



router.get(
  '/admin/professionnels-en-attente',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  authController.getProfessionnelsEnAttente
);
// ROUTES LIEN EMAIL (token crypto, PAS JWT)
router.get(
  '/admin/valider/:utilisateurId',
  validate(validationLienAdmin),
  authController.validerProfessionnelParLien
);

router.get(
  '/admin/refuser/:utilisateurId',
  validate(validationLienAdmin),
  authController.refuserProfessionnelParLien
);

module.exports = router;
