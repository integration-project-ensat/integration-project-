const { body, query } = require('express-validator');
const { Rules } = require('./auth.validator');

const PasswordValidator = {
    // POST /api/auth/mot-de-passe-oublie
    motDePasseOublie: [
        Rules.email
    ],

    // GET /api/auth/verifier-token-reset?token=xxx
    verifierTokenReset: [
        query('token')
            .notEmpty().withMessage('Token manquant')
            .isLength({ min: 64, max: 64 }).withMessage('Token invalide')
            .matches(/^[a-f0-9]+$/).withMessage('Format de token invalide')
    ],

    // POST /api/auth/reinitialiser-mot-de-passe
    reinitialiserMotDePasse: [
        body('token')
            .notEmpty().withMessage('Token manquant')
            .isLength({ min: 64, max: 64 }).withMessage('Token invalide'),

        body('nouveau_mot_de_passe')
            .notEmpty().withMessage('Le nouveau mot de passe est obligatoire')
            .isLength({ min: 8, max: 128 }).withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
            .matches(/[A-Z]/).withMessage('Doit contenir au moins une majuscule')
            .matches(/[a-z]/).withMessage('Doit contenir au moins une minuscule')
            .matches(/\d/).withMessage('Doit contenir au moins un chiffre')
            .matches(/[@#!$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Doit contenir au moins un caractère spécial'),

        body('confirmation_mot_de_passe')
            .notEmpty().withMessage('La confirmation est obligatoire')
            .custom((value, { req }) => {
                if (value !== req.body.nouveau_mot_de_passe) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }
                return true;
            })
    ]
};

module.exports = { PasswordValidator };