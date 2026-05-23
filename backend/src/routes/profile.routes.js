const express = require("express");
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Profils
 *   description: Gestion des profils utilisateurs
 */

/**
 * @openapi
 * /api/profils/{id}:
 *   get:
 *     summary: Récupère le profil d'un utilisateur
 *     tags: [Profils]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profil non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.get("/:id", profileController.getProfile);

/**
 * @openapi
 * /api/profils/{id}:
 *   patch:
 *     summary: Met à jour le profil d'un utilisateur
 *     tags: [Profils]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               titre:
 *                 type: string
 *                 example: "Développeur Full Stack"
 *               bio:
 *                 type: string
 *                 example: "Passionné de développement web"
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profil non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.patch("/:id", profileController.updateProfile);

/**
 * @openapi
 * /api/profils/{id}/avatar:
 *   post:
 *     summary: Upload l'avatar d'un utilisateur
 *     tags: [Profils]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Fichier invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// router.post("/:id/avatar", profileController.uploadAvatar);

module.exports = router;