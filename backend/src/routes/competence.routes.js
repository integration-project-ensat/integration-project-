const express = require('express');
const router = express.Router();

const competenceController = require('../controllers/competence.controller');

const {
  authentifier,
  autoriserRoles
} = require('../middlewares/auth.middleware');

const validate = require('../middlewares/validate');

const { ROLES } = require('../config/roles');

const competenceValidator = require('../validators/competence.validator');

const {
  idParamValidator
} = require('../validators/commonId.validator');

router.use(authentifier);

//  ROUTES ÉTUDIANT

// GET /competences/me
router.get(
  '/moi',
  competenceController.getUserCompetences
);

// GET /competences/me/suggestions
router.get(
  '/moi/suggestions',
  competenceController.getUserSuggestions
);

// POST /competences/me
router.post(
  '/moi',
  autoriserRoles(ROLES.ETUDIANT),
  validate(competenceValidator.addUserCompetence),
  competenceController.addUserCompetence
);

// POST /competences/me/bulk
router.post(
  '/moi/bulk',
  autoriserRoles(ROLES.ETUDIANT),
  validate(competenceValidator.bulkUserCompetences),
  competenceController.addBulkUserCompetences
);

// PATCH /competences/me/:id
router.patch(
  '/moi/:id',
  autoriserRoles(ROLES.ETUDIANT),
  validate(idParamValidator),
  validate(competenceValidator.updateUserCompetence),
  competenceController.updateUserCompetence
);

// DELETE /competences/me/:id
router.delete(
  '/moi/:id',
  autoriserRoles(ROLES.ETUDIANT),
  validate(idParamValidator),
  competenceController.removeUserCompetence
);

//  CATALOGUE 
// GET /competences
router.get(
  '/',
  competenceController.getAllCompetences
);

// GET /competences/par-type
router.get(
  '/par-type',
  competenceController.getCompetencesByType
);

// GET /competences/suggestions/:etudiantId
router.get(
  '/suggestions/:etudiantId',
  validate(competenceValidator.etudiantIdParam),
  competenceController.getSuggestionsForEtudiant
);

// GET /competences/:id
router.get(
  '/:id',
  validate(idParamValidator),
  competenceController.getCompetenceById
);

// ADMIN 

// POST /competences/admin
router.post(
  '/admin',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(competenceValidator.createCompetence),
  competenceController.createCompetence
);

// PATCH /competences/admin/:id
router.patch(
  '/admin/:id',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(idParamValidator),
  validate(competenceValidator.updateCompetence),
  competenceController.updateCompetence
);

// DELETE /competences/admin/:id
router.delete(
  '/admin/:id',
  autoriserRoles(ROLES.ADMINISTRATEUR),
  validate(idParamValidator),
  competenceController.deleteCompetence
);

module.exports = router;