// src/validators/diplome.validator.js
const { body, param } = require('express-validator');

const anneeActuelle = new Date().getFullYear();

// Règles body communes pour créer et modifier
const reglesBody = [
  body('domaine')
    .optional()
    .isLength({ max: 200 }).withMessage('Le domaine ne doit pas dépasser 200 caractères')
    .trim(),

  body('etablissement')
    .optional()
    .isLength({ max: 200 }).withMessage('L\'établissement ne doit pas dépasser 200 caractères')
    .trim(),

  body('annee_debut')
    .optional()
    .isInt({ min: 1950, max: anneeActuelle })
    .withMessage(`Année de début invalide (entre 1950 et ${anneeActuelle})`)
    .toInt(),

  body('annee_fin')
    .optional()
    .isInt({ min: 1950, max: anneeActuelle + 10 })
    .withMessage(`Année de fin invalide (max ${anneeActuelle + 10})`)
    .toInt()
    .custom((value, { req }) => {
      if (req.body.annee_debut && value < req.body.annee_debut) {
        throw new Error('L\'année de fin doit être supérieure ou égale à l\'année de début');
      }
      return true;
    })
];

// Validation de l'ID en param
const regleId = [
  param('id')
    .notEmpty().withMessage('ID manquant').bail()
    .isInt({ min: 1 }).withMessage('ID invalide').bail()
    .toInt()
];

const DiplomeValidator = {

  // POST /diplomes
  creer: [
    body('titre_diplome')
      .notEmpty().withMessage('Le titre du diplôme est requis').bail()
      .isLength({ max: 200 }).withMessage('Le titre ne doit pas dépasser 200 caractères')
      .trim(),
    ...reglesBody
  ],

  // PUT /diplomes/:id
  mettreAJour: [
    ...regleId,
    body('titre_diplome')
      .optional()
      .isLength({ max: 200 }).withMessage('Le titre ne doit pas dépasser 200 caractères')
      .trim(),
    ...reglesBody
  ],

  // DELETE /diplomes/:id  et  GET /diplomes/:id
  parId: regleId
};

module.exports = { DiplomeValidator };