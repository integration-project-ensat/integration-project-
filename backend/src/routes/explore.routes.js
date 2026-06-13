const express = require("express");
const {
  getProfiles,
  getProfileById,
  getFilters,
} = require("../controllers/explore.controller");

const router = express.Router();

router.get("/profiles", getProfiles);
router.get("/profiles/:id", getProfileById);
router.get("/filters", getFilters);

module.exports = router;
