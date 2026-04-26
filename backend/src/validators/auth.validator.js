
const { body } = require('express-validator');
const { PUBLIC_ROLES, ROLES } = require('../config/roles');

const Rules = {
  nom: body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le nom contient des caracteres non autorises'),

  prenom: body('prenom')
    .trim()
    .notEmpty().withMessage('Le prenom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le prenom doit contenir entre 2 et 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le prenom contient des caracteres non autorises'),

  email: body('email')
    .trim()
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email trop long'),

  motDePasse: body('mot_de_passe')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caracteres')
    .matches(/[A-Z]/).withMessage('Doit contenir au moins une majuscule')
    .matches(/[a-z]/).withMessage('Doit contenir au moins une minuscule')
    .matches(/\d/).withMessage('Doit contenir au moins un chiffre'),

  confirmationMotDePasse: body('confirmation_mot_de_passe')
    .notEmpty().withMessage('La confirmation est obligatoire')
    .custom((value, { req }) => {
      if (value !== req.body.mot_de_passe) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),

  rolePublic: body('role')
    .notEmpty().withMessage('Le role est obligatoire')
    .isIn(Object.values(PUBLIC_ROLES))
    .withMessage('Role invalide. Choix : Etudiant, Professeur, Professionnel'),

  // === ETUDIANT ===
  numeroEtudiant: body('numero_etudiant')
    .if(body('role').equals('ETUDIANT'))
    .notEmpty().withMessage('Le numero etudiant est obligatoire')
    .isLength({ min: 3, max: 20 }).withMessage('Numero etudiant invalide (3-20 caracteres)')
    .matches(/^[A-Z0-9-]+$/i).withMessage('Format : lettres, chiffres et tirets uniquement'),

  filiere: body('filiere')
    .if(body('role').equals('ETUDIANT'))
    .notEmpty().withMessage('La filiere est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Filiere invalide'),

  anneeUniversitaire: body('annee_universitaire')
    .if(body('role').equals('ETUDIANT'))
    .notEmpty().withMessage('L\'annee universitaire est obligatoire')
    .matches(/^\d{4}\/\d{4}$/).withMessage('Format : AAAA/AAAA (ex: 2025/2026)'),

  // === PROFESSEUR ===
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

  // === PROFESSIONNEL ===
  entreprise: body('entreprise')
    .if(body('role').equals('PROFESSIONNEL'))
    .notEmpty().withMessage('L\'entreprise est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Entreprise invalide'),

  poste: body('poste')
    .if(body('role').equals('PROFESSIONNEL'))
    .notEmpty().withMessage('Le poste est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Poste invalide'),

  // === ADMIN ===
  roleAdmin: body('role')
    .notEmpty().withMessage('Le role est obligatoire')
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

module.exports = { Rules, AuthValidator };