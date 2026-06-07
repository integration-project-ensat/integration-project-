const express = require("express");

const router = express.Router();

const controller = require(
  "../controllers/portfolioAnalyzer.controller"
);

router.get(
  "/:etudiantId",
  controller.analyzePortfolio
);

module.exports = router;