const express = require('express');
const router = express.Router();

<<<<<<< HEAD
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
  '/me',
  competenceController.getUserCompetences
);

// GET /competences/me/suggestions
router.get(
  '/me/suggestions',
  competenceController.getUserSuggestions
);

// POST /competences/me
router.post(
  '/me',
  autoriserRoles(ROLES.ETUDIANT),
  validate(competenceValidator.addUserCompetence),
  competenceController.addUserCompetence
);

// POST /competences/me/bulk
router.post(
  '/me/bulk',
  autoriserRoles(ROLES.ETUDIANT),
  validate(competenceValidator.bulkUserCompetences),
  competenceController.addBulkUserCompetences
);

// PATCH /competences/me/:id
router.patch(
  '/me/:id',
  autoriserRoles(ROLES.ETUDIANT),
  validate(idParamValidator),
  validate(competenceValidator.updateUserCompetence),
  competenceController.updateUserCompetence
);

// DELETE /competences/me/:id
router.delete(
  '/me/:id',
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

=======
const competenceController = require("../controllers/competence.controller");

/**
 * @openapi
 * tags:
 *   name: Competences
 *   description: Gestion des compétences
 */

/**
 * @openapi
 * /api/competences:
 *   get:
 *     summary: Liste toutes les compétences
 *     tags: [Competences]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom
 *     responses:
 *       200:
 *         description: Liste des compétences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Competence'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", competenceController.getAllCompetences);

/**
 * @openapi
 * /api/competences/suggestions/{etudiantId}:
 *   get:
 *     summary: Suggestions de compétences pour un étudiant
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: etudiantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Liste des compétences suggérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Competence'
 *       404:
 *         description: Étudiant non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/suggestions/:etudiantId", competenceController.getSuggestionsForEtudiant);

/**
 * @openapi
 * /api/competences/{id}:
 *   get:
 *     summary: Récupère une compétence par son ID
 *     tags: [Competences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compétence
 *     responses:
 *       200:
 *         description: Compétence trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competence'
 *       404:
 *         description: Compétence non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", competenceController.getCompetenceById);

/**
 * @openapi
 * /api/competences:
 *   post:
 *     summary: Crée une nouvelle compétence
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "JavaScript"
 *               niveau:
 *                 type: string
 *                 enum: [debutant, intermediaire, avance, expert]
 *                 example: "avance"
 *     responses:
 *       201:
 *         description: Compétence créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competence'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", competenceController.createCompetence);

/**
 * @openapi
 * /api/competences/{id}:
 *   patch:
 *     summary: Modifie une compétence existante
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compétence
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "TypeScript"
 *               niveau:
 *                 type: string
 *                 enum: [debutant, intermediaire, avance, expert]
 *                 example: "expert"
 *     responses:
 *       200:
 *         description: Compétence modifiée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competence'
 *       404:
 *         description: Compétence non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id", competenceController.updateCompetence);

/**
 * @openapi
 * /api/competences/{id}:
 *   delete:
 *     summary: Supprime une compétence
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compétence à supprimer
 *     responses:
 *       200:
 *         description: Compétence supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Compétence non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", competenceController.deleteCompetence);

>>>>>>> origin/feat/swagger-docs
module.exports = router;