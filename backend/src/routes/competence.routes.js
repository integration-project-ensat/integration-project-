const express = require("express");
const router = express.Router();

const competenceController = require("../controllers/competence.controller");
// const { authentifier, autoriserRoles } = require("../middlewares/auth.middleware");

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

module.exports = router;
