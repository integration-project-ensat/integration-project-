const express = require("express");
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Diplomes
 *   description: Gestion des diplômes des utilisateurs
 */

/**
 * @openapi
 * /api/diplomes/{userId}:
 *   get:
 *     summary: Liste tous les diplômes d'un utilisateur
 *     tags: [Diplomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des diplômes
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
 *                     $ref: '#/components/schemas/Diplome'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.get("/:userId", diplomeController.getDiplomes);

/**
 * @openapi
 * /api/diplomes/{userId}:
 *   post:
 *     summary: Ajoute un diplôme à un utilisateur
 *     tags: [Diplomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - etablissement
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Master Informatique"
 *               etablissement:
 *                 type: string
 *                 example: "Université de Paris"
 *               annee:
 *                 type: integer
 *                 example: 2023
 *     responses:
 *       201:
 *         description: Diplôme ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Diplome'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.post("/:userId", diplomeController.createDiplome);

/**
 * @openapi
 * /api/diplomes/{userId}/{id}:
 *   patch:
 *     summary: Modifie un diplôme
 *     tags: [Diplomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du diplôme
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Licence Informatique"
 *               etablissement:
 *                 type: string
 *                 example: "Université de Lyon"
 *               annee:
 *                 type: integer
 *                 example: 2021
 *     responses:
 *       200:
 *         description: Diplôme modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Diplome'
 *       404:
 *         description: Diplôme non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.patch("/:userId/:id", diplomeController.updateDiplome);

/**
 * @openapi
 * /api/diplomes/{userId}/{id}:
 *   delete:
 *     summary: Supprime un diplôme
 *     tags: [Diplomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du diplôme à supprimer
 *     responses:
 *       200:
 *         description: Diplôme supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Diplôme non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.delete("/:userId/:id", diplomeController.deleteDiplome);

module.exports = router;