const { param } = require('express-validator');

const ConnexionValidator = {
  userId: [
    param('userId')
      .notEmpty().withMessage('ID utilisateur manquant').bail()
      .isInt({ min: 1 }).withMessage('ID utilisateur invalide')
      .toInt()
  ],

  id: [
    param('id')
      .notEmpty().withMessage('ID connexion manquant').bail()
      .isInt({ min: 1 }).withMessage('ID connexion invalide')
      .toInt()
  ]
};

module.exports = { ConnexionValidator };