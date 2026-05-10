const express = require("express");
const router  = express.Router();

const technologieController = require("../controllers/technologie.controller");

/**
 * @openapi
 * tags:
 *   name: Technologies
 *   description: Gestion du catalogue de technologies
 */

/**
 * @openapi
 * /api/technologies:
 *   get:
 *     summary: Liste toutes les technologies
 *     tags: [Technologies]
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
 *         name: categorie
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom
 *     responses:
 *       200:
 *         description: Liste des technologies
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
 *                     $ref: '#/components/schemas/Technologie'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", technologieController.getAllTechnologies);

/**
 * @openapi
 * /api/technologies/{id}:
 *   get:
 *     summary: Récupère une technologie par son ID
 *     tags: [Technologies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la technologie
 *     responses:
 *       200:
 *         description: Technologie trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Technologie'
 *       404:
 *         description: Technologie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", technologieController.getTechnologieById);

/**
 * @openapi
 * /api/technologies:
 *   post:
 *     summary: Crée une nouvelle technologie
 *     tags: [Technologies]
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
 *                 example: "React"
 *               categorie:
 *                 type: string
 *                 example: "Frontend"
 *               est_validee:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Technologie créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Technologie'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", technologieController.createTechnologie);

/**
 * @openapi
 * /api/technologies/{id}:
 *   patch:
 *     summary: Modifie une technologie existante
 *     tags: [Technologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la technologie
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Vue.js"
 *               categorie:
 *                 type: string
 *                 example: "Frontend"
 *               est_validee:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Technologie modifiée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Technologie'
 *       404:
 *         description: Technologie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id", technologieController.updateTechnologie);

/**
 * @openapi
 * /api/technologies/{id}/valider:
 *   patch:
 *     summary: Valide une technologie détectée automatiquement
 *     tags: [Technologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la technologie à valider
 *     responses:
 *       200:
 *         description: Technologie validée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Technologie'
 *       404:
 *         description: Technologie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/valider", technologieController.validerTechnologie);

/**
 * @openapi
 * /api/technologies/{id}:
 *   delete:
 *     summary: Supprime une technologie
 *     tags: [Technologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la technologie à supprimer
 *     responses:
 *       200:
 *         description: Technologie supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Technologie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", technologieController.deleteTechnologie);

module.exports = router;