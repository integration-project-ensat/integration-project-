const express = require("express");
const router  = express.Router();

const technologieController = require("../controllers/technologie.controller");
// const { authentifier, autoriserRoles } = require("../middlewares/auth.middleware");

/**
 * SCRUM-89 — Technology Routes
 *
 * Base : /api/technologies
 *
 * Middlewares (décommenter quand prêts) :
 *   authenticate  → vérifie le JWT
 *   requireRole   → vérifie le rôle (ex: "ADMINISTRATEUR")
 */

// ─── Lecture — tous les utilisateurs authentifiés ───────────────────────────

/**
 * GET /api/technologies
 * Liste paginée des technologies validées
 * Query params : ?page=1&limit=10&categorie=Web&search=react
 */
router.get(
  "/",
  // authentifier,
  technologieController.getAllTechnologies
);

/**
 * GET /api/technologies/:id
 * Détail d'une technologie
 */
router.get(
  "/:id",
  // authentifier,
  technologieController.getTechnologieById
);

// ─── Écriture — réservé ADMINISTRATEUR ──────────────────────────────────────

/**
 * POST /api/technologies
 * Créer une nouvelle technologie dans le catalogue
 * Body : { nom, categorie?, est_validee? }
 */
router.post(
  "/",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  technologieController.createTechnologie
);

/**
 * PATCH /api/technologies/:id
 * Modifier une technologie existante
 * Body : { nom?, categorie?, est_validee? }
 */
router.patch(
  "/:id",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  technologieController.updateTechnologie
);

/**
 * PATCH /api/technologies/:id/valider
 * Valider une technologie détectée automatiquement (ex: depuis GitHub)
 */
router.patch(
  "/:id/valider",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  technologieController.validerTechnologie
);

/**
 * DELETE /api/technologies/:id
 * Supprimer une technologie (bloqué si utilisée dans des projets)
 */
router.delete(
  "/:id",
  // authentifier,
  // autoriserRoles("ADMINISTRATEUR"),
  technologieController.deleteTechnologie
);

module.exports = router;
