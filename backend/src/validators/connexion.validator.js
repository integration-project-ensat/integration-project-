const { body, param } = require('express-validator')

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
  ],

  creerRules: [
    body('id_destinataire').isInt({ min: 1 }).withMessage('Destinataire invalide'),
    body('message').optional().isString().withMessage('Message invalide'),
  ],

  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID connexion invalide'),
  ],
}

module.exports = ConnexionValidator