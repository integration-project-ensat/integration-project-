const express = require("express");
const router = express.Router();

const competenceController = require("../controllers/competence.controller");
const { valider, addCompetenceRules, updateCompetenceRules, bulkAddRules } = require('../validators/competence.validator');
const { authentifier, autoriserRoles } = require("../middlewares/auth.middleware");

router.get(
  "/",
  // authentifier,
  competenceController.getAllCompetences
);

router.get(
  "/suggestions/:etudiantId",
  // authentifier,
  competenceController.getSuggestionsForEtudiant
);

router.get(
  "/by-type",
  // authentifier,
  competenceController.getCompetencesByType
);

router.get(
  "/:id",
  // authentifier,
  competenceController.getCompetenceById
);

router.post(
  "/",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  competenceController.createCompetence
);

router.patch(
  "/:id",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  competenceController.updateCompetence
);

router.delete(
  "/:id",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  competenceController.deleteCompetence
);

// Routes pour le profil utilisateur (étudiants)
const etudiantOnly = [authentifier, autoriserRoles('ETUDIANT')];

router.get('/profile', ...etudiantOnly, competenceController.getUserCompetences);
router.get('/profile/suggestions', ...etudiantOnly, competenceController.getUserSuggestions);
router.post('/profile', ...etudiantOnly, valider(addCompetenceRules), competenceController.addUserCompetence);
router.post('/profile/bulk', ...etudiantOnly, valider(bulkAddRules), competenceController.addBulkUserCompetences);
router.put('/profile/:id', ...etudiantOnly, valider(updateCompetenceRules), competenceController.updateUserCompetence);
router.delete('/profile/:id', ...etudiantOnly, competenceController.removeUserCompetence);

module.exports = router;
