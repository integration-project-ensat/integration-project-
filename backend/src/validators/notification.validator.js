const { param, query } = require('express-validator');

const NotificationValidator = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID notification invalide')
      .toInt()
  ],

  filtre: [
    query('type')
      .optional()
      .isString()
      .withMessage('Type invalide')
  ]
};

module.exports = { NotificationValidator };