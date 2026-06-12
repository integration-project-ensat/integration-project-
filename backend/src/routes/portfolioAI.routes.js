const express = require("express");

const router = express.Router();

const controller =
require("../controllers/portfolioAI.controller");

router.post(
  "/analyze",
  controller.analyzePortfolio
);

router.post(
  "/improve-project",
  controller.improveProject
);

router.post(
  "/generate-summary",
  controller.generateSummary
);

router.post(
  "/generate-readme",
  controller.generateReadme
);

module.exports = router;