// src/controllers/profil.controller.js
const profilService = require('../services/profil.service');

// GET /profil/me
const getMonProfil = async (req, res, next) => {
  try {
    const profil = await profilService.getMonProfil(req.utilisateur);

    if (!profil) {
      return res.status(404).json({ success: false, message: 'Profil introuvable' });
    }

    return res.status(200).json({ success: true, data: profil });
  } catch (err) {
    next(err);
  }
};

// GET /profil/:id
const getProfilParId = async (req, res, next) => {
  try {
    const profil = await profilService.getProfilParId(req.params.id, req.utilisateur);

    if (!profil) {
      return res.status(404).json({ success: false, message: 'Profil introuvable' });
    }

    return res.status(200).json({ success: true, data: profil });
  } catch (err) {
    next(err); // 403 si profil privé
  }
};

// PUT /profil/me — mettre à jour son propre profil
const mettreAJourMonProfil = async (req, res, next) => {
  try {
    const profil = await profilService.mettreAJourProfil(
      req.utilisateur.id_utilisateur,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: profil
    });
  } catch (err) {
    next(err);
  }
};

// PUT /profil/:id — admin ou propriétaire (upsert)
const updateProfilParId = async (req, res, next) => {
  try {
    const profil = await profilService.updateProfilParId(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: profil
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMonProfil,
  getProfilParId,
  mettreAJourMonProfil,
  updateProfilParId
};