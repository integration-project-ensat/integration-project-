const { param } = require('express-validator');

const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID manquant')
    .bail()
    .isInt({ min: 1 })
    .withMessage('ID invalide')
    .bail()
    .toInt()
];

module.exports = {
  idParamValidator
};