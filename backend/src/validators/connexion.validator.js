const { body, param } = require('express-validator')

module.exports = {
  creerRules: [
    body('id_destinataire').isInt({ min: 1 }).withMessage('Destinataire invalide'),
    body('message').optional().isString().withMessage('Message invalide'),
  ],

  idParamRules: [
    param('id').isInt({ min: 1 }).withMessage('ID connexion invalide'),
  ],
}
