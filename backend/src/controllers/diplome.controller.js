// src/controllers/diplome.controller.js
const diplomeService = require('../services/diplome.service');
const { ROLES } = require('../config/roles');

// POST /diplomes — créer un diplôme (étudiant connecté)
const creerDiplome = async (req, res, next) => {
  try {
    const diplome = await diplomeService.creerDiplome(
      req.utilisateur.id_utilisateur,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Diplôme ajouté avec succès',
      data: diplome
    });
  } catch (err) {
    next(err);
  }
};

// GET /diplomes — lister ses propres diplômes
const getMesDiplomes = async (req, res, next) => {
  try {
    const diplomes = await diplomeService.getDiplomesEtudiant(
      req.utilisateur.id_utilisateur
    );

    return res.status(200).json({
      success: true,
      total: diplomes.length,
      data: diplomes
    });
  } catch (err) {
    next(err);
  }
};

// GET /diplomes/etudiant/:etudiantId — diplômes d'un étudiant (prof / admin)
const getDiplomesParEtudiant = async (req, res, next) => {
  try {
    const diplomes = await diplomeService.getDiplomesEtudiant(
      req.params.etudiantId
    );

    return res.status(200).json({
      success: true,
      total: diplomes.length,
      data: diplomes
    });
  } catch (err) {
    next(err);
  }
};

// GET /diplomes/:id — voir un diplôme par ID
// étudiant : ownership vérifié dans le service ; admin/prof : accès libre
const getDiplomeParId = async (req, res, next) => {
  try {
    const idEtudiant = req.utilisateur.role === ROLES.ETUDIANT
      ? req.utilisateur.id_utilisateur
      : null;

    const diplome = await diplomeService.getDiplomeParId(
      req.params.id,
      idEtudiant
    );

    return res.status(200).json({
      success: true,
      data: diplome
    });
  } catch (err) {
    next(err);
  }
};

// PUT /diplomes/:id — modifier un diplôme (ownership vérifié dans le service)
const mettreAJourDiplome = async (req, res, next) => {
  try {
    const diplome = await diplomeService.mettreAJourDiplome(
      req.params.id,
      req.utilisateur.id_utilisateur,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Diplôme mis à jour avec succès',
      data: diplome
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /diplomes/:id — supprimer un diplôme (ownership vérifié dans le service)
const supprimerDiplome = async (req, res, next) => {
  try {
    const result = await diplomeService.supprimerDiplome(
      req.params.id,
      req.utilisateur.id_utilisateur
    );

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  creerDiplome,
  getMesDiplomes,
  getDiplomesParEtudiant,
  getDiplomeParId,
  mettreAJourDiplome,
  supprimerDiplome
};