const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const AuthValidator = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

router.post('/sinscrire', validate(AuthValidator.register), authController.register);
router.post('/seconnecter', validate(AuthValidator.login), authController.login);
router.get('/currentUser', authentifier, authController.getCurrentUser);

router.post(
  '/admin/creer',
  authentifier,
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(AuthValidator.createAdmin),
  authController.createAdmin
);

module.exports = router;