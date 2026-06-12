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
const journalController = require('../controllers/journal.controller');

function hasOAuthCredentials(clientId, clientSecret, callbackUrl) {
  return Boolean(
    clientId &&
    clientSecret &&
    callbackUrl &&
    !clientId.startsWith('ton_') &&
    !clientSecret.startsWith('ton_') &&
    !clientId.startsWith('REMPLACE_MOI') &&
    !clientSecret.startsWith('REMPLACE_MOI')
  );
}

function requireGithubOAuthConfig(req, res, next) {
  if (
    hasOAuthCredentials(
      process.env.GITHUB_CLIENT_ID,
      process.env.GITHUB_CLIENT_SECRET,
      process.env.GITHUB_CALLBACK_URL
    )
  ) {
    return next();
  }

  return res.status(500).send(`
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Configuration GitHub manquante</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #1f2937; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Configuration GitHub OAuth manquante</h1>
        <p>Remplace <code>GITHUB_CLIENT_ID</code> et <code>GITHUB_CLIENT_SECRET</code> dans <code>backend/.env</code> par les vraies valeurs de ton OAuth App GitHub, puis redemarre le backend.</p>
        <p>Callback attendu: <code>http://localhost:3000/api/auth/github/callback</code></p>
      </body>
    </html>
  `);
}

function requireGoogleOAuthConfig(req, res, next) {
  if (
    hasOAuthCredentials(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    )
  ) {
    return next();
  }

  return res.status(500).send(`
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Configuration Google manquante</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #1f2937; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Configuration Google OAuth manquante</h1>
        <p>Remplace <code>GOOGLE_CLIENT_ID</code> et <code>GOOGLE_CLIENT_SECRET</code> dans <code>backend/.env</code> par les vraies valeurs d'un client OAuth Google de type <strong>Web application</strong>, puis redemarre le backend.</p>
        <p>Callback attendu: <code>http://localhost:3000/api/auth/google/callback</code></p>
      </body>
    </html>
  `);
}

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

//logout
router.post('/deconnecter', authentifier, authController.logout);

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
  requireGoogleOAuthConfig,
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  requireGoogleOAuthConfig,
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
  '/github',
  requireGithubOAuthConfig,
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

router.get(
  '/github/callback',
  requireGithubOAuthConfig,
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login'
  }),
  authController.githubCallback
);

router.post(
  '/github/complete-profile',
  authController.completeGithubSignup
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
router.get(
  '/admin/journal-connexions',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  journalController.getJournalConnexions
);

module.exports = router;
