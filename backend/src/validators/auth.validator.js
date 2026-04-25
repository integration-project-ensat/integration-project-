const {body} = require('express-validator');
const {PUBLIC_ROLES,ROLES} = require('../config/roles');

const Rules = {
    nom: body('nom')
        .trim()
        .notEmpty().withMessage('Le nom est requis')
        .isLength({min:2, max: 50}).withMessage('Le nom doit contenir entre 2 et 50 caractères')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets'),


    prenom: body('prenom')
        .trim()
        .notEmpty().withMessage('Le prénom est requis')
        .isLength({min:2, max: 50}).withMessage('Le prénom doit contenir entre 2 et 50 caractères')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Le prénom ne doit contenir que des lettres, espaces, apostrophes ou tirets'), 

    email: body('email')
        .trim()
        .notEmpty().withMessage('L\'email est requis')
        .isEmail().withMessage('Format d\'email invalide')
        .normalizeEmail()
        .isLength({max: 255}).withMessage('Email trop long'),

    mot_de_passe: body('mot_de_passe')
        .notEmpty().withMessage('Le mot de passe est requis')
        .isLength({min: 8}).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[@$!%*?&]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)'),

        confirmation_mot_de_passe: body('confirmation_mot_de_passe')
        .notEmpty().withMessage('La confirmation du mot de passe est requise')
        .custom((value, { req }) => {
            if (value !== req.body.mot_de_passe) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            return true;
        }),

    role: body('role')
        .notEmpty().withMessage('Le rôle est requis')
        .isIn(Object.values(PUBLIC_ROLES).concat(Object.values(ROLES))),

        numeroEtudiant: body('numeroEtudiant')
        .if(body('role').equals(ROLES.ETUDIANT))
        .notEmpty().withMessage('Le numéro étudiant est requis pour les étudiants')
        .isLength({min: 5, max: 20}).withMessage('Le numéro étudiant doit contenir entre 5 et 20 caractères')
        .matches(/^[A-Za-z0-9]+$/).withMessage('Le numéro étudiant ne doit contenir que des lettres et des chiffres'),

        filiere: body('filiere')
        .if(body('role').equals(ROLES.ETUDIANT))
        .notEmpty().withMessage('La filière est requise pour les étudiants')
        .isLength({min: 2, max: 100}).withMessage('La filière doit contenir entre 2 et 100 caractères'),

        anneeUniversitaire: body('anneeUniversitaire')
        .if(body('role').equals(ROLES.ETUDIANT))
        .notEmpty().withMessage('L\'année universitaire est requise pour les étudiants')
        .matches(/^\d{4}\/\d{4}$/).withMessage('L\'année universitaire doit être au format AAAA/AAAA (ex: 2025/2026)'),

         codeAdministratif: body('code_administratif')
        .if(body('role').equals('PROFESSEUR'))
        .notEmpty().withMessage('Le code administratif est obligatoire')
        .isLength({ min: 3, max: 20 }).withMessage('Code administratif invalide (3-20 caracteres)')
        .matches(/^[A-Z0-9-]+$/i).withMessage('Format : lettres, chiffres et tirets uniquement'),

        departement: body('departement')
        .if(body('role').equals('PROFESSEUR'))
            .notEmpty().withMessage('Le departement est obligatoire')
            .isLength({ min: 2, max: 100 }).withMessage('Departement invalide'),

  specialite: body('specialite')
    .if(body('role').equals('PROFESSEUR'))
    .notEmpty().withMessage('La specialite est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Specialite invalide'),

  // === PROFESSIONNEL (strict) ===
  entreprise: body('entreprise')
    .if(body('role').equals('PROFESSIONNEL'))
    .notEmpty().withMessage('L\'entreprise est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Entreprise invalide'),

  poste: body('poste')
    .if(body('role').equals('PROFESSIONNEL'))
    .notEmpty().withMessage('Le poste est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Poste invalide'),

  // === ADMIN (creation reservee) ===
  roleAdmin: body('role')
    .notEmpty().withMessage('Le rle est obligatoire')
    .isIn([ROLES.ADMINISTRATEUR])
    .withMessage('Seul le role Administrateur est autorise')
};

const AuthValidator = {
  register: [
    Rules.nom,
    Rules.prenom,
    Rules.email,
    Rules.motDePasse,
    Rules.confirmationMotDePasse,
    Rules.rolePublic,
    Rules.numeroEtudiant,
    Rules.filiere,
    Rules.anneeUniversitaire,
    Rules.codeAdministratif,
    Rules.departement,
    Rules.specialite,
    Rules.entreprise,
    Rules.poste
  ],

  login: [
    Rules.email,
    body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire')
  ],

  createAdmin: [
    Rules.nom,
    Rules.prenom,
    Rules.email,
    Rules.motDePasse,
    Rules.confirmationMotDePasse,
    Rules.roleAdmin
  ]
};

module.exports = AuthValidator;

