const { body, param } = require('express-validator');

const ProfilValidator = {
    //PUT/profil/me ou PUT/profil/:id (admin)
  mettreAJour: [
    body('photo_profil')
      .optional()
      .isURL().withMessage('URL de photo invalide')
      .isLength({ max: 500 }).withMessage('URL trop longue'),

    body('name')
      .optional()
      .isString().withMessage('Nom invalide')
      .isLength({ max: 200 }).withMessage('Nom trop long')
      .trim(),

    body('title')
      .optional()
      .isString().withMessage('Titre invalide')
      .isLength({ max: 200 }).withMessage('Titre trop long')
      .trim(),

    body('telephone')
      .optional()
      .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Numéro de téléphone invalide')
      .isLength({ max: 20 }),

    body('adresse')
      .optional()
      .isLength({ max: 100 }).withMessage('Adresse trop longue')
      .trim(),

    body('etablissement')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 200 }).withMessage('Etablissement trop long')
      .trim(),

    body('email_professionnel')
      .optional()
      .isEmail().withMessage('Email professionnel invalide')
      .isLength({ max: 255 }),

    body('bio')
      .optional()
      .isLength({ max: 2000 }).withMessage('La bio ne doit pas dépasser 2000 caractères')
      .trim(),

    body('linkedin_url')
      .optional()
      .isURL({protocols:['https'],host_whitelist: ['www.linkedin.com', 'linkedin.com']})
      .withMessage('URL LinkedIn invalide (doit commencer par https://linkedin.com)'),
      

    body('visibilite')
      .optional()
      .isIn(['PUBLIC', 'PRIVE', 'ENSEIGNANTS', 'LIEN_PARTAGE'])
      .withMessage('Visibilité invalide')
  ],
//GET/profil/:id
  getById: [
    param('id')
      .notEmpty().withMessage('ID manquant').bail()
      .isInt({ min: 1 }).withMessage('ID invalide')
      .toInt()
  ]
};

module.exports = { ProfilValidator };
