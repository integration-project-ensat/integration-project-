const express = require('express');
const router = express.Router();

const badgeController = require('../controllers/badge.controller');
const { BadgeValidator } = require('../validators/badge.validator');
const validate = require('../middlewares/validate');

const {
  authentifier,
  autoriserRoles
} = require('../middlewares/auth.middleware');

const { ROLES } = require('../config/roles');

router.use(authentifier);

router.get('/', badgeController.getBadges);

router.get(
  '/me',
  autoriserRoles(ROLES.ETUDIANT),
  badgeController.getMesBadges
);

router.post(
  '/me/evaluer',
  autoriserRoles(ROLES.ETUDIANT),
  badgeController.evaluerMesBadges
);

router.get(
  '/admin/all',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  badgeController.getAllBadgesAdmin
);

router.post(
  '/',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(BadgeValidator.creer),
  badgeController.creerBadge
);

router.put(
  '/:id',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate([...BadgeValidator.id, ...BadgeValidator.modifier]),
  badgeController.modifierBadge
);

router.delete(
  '/:id',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(BadgeValidator.id),
  badgeController.supprimerBadge
);

router.post(
  '/etudiant/:id/evaluer',
  autoriserRoles(ROLES.ADMINISTRATEUR, ROLES.PROFESSEUR),
  validate(BadgeValidator.id),
  badgeController.evaluerBadgesEtudiant
);

module.exports = router;