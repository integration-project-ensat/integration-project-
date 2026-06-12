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
    next(err);
  }
};

// PUT /profil/me
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

// PUT /profil/:id
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

// GET /profil?search=&filiere=&ville=&score=&page=
const explorerProfils = async (req, res, next) => {
  try {
    const resultat = await profilService.explorerProfils(req.query);
    return res.status(200).json({ success: true, ...resultat });
  } catch (err) {
    next(err);
  }
};

// POST /profil/:id/save
const sauvegarderProfil = async (req, res, next) => {
  try {
    const saved = await profilService.sauvegarderProfil(
      req.utilisateur.id_utilisateur,
      req.params.id
    );
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

// DELETE /profil/:id/save
const supprimerSauvegarde = async (req, res, next) => {
  try {
    await profilService.supprimerSauvegarde(
      req.utilisateur.id_utilisateur,
      req.params.id
    );
    return res.status(200).json({ success: true, message: 'Sauvegarde supprimée' });
  } catch (err) {
    next(err);
  }
};

// GET /profil/saved
const getMesSauvegardes = async (req, res, next) => {
  try {
    const sauvegardes = await profilService.getMesSauvegardes(
      req.utilisateur.id_utilisateur
    );
    return res.status(200).json({ success: true, data: sauvegardes });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMonProfil,
  getProfilParId,
  mettreAJourMonProfil,
  updateProfilParId,
  explorerProfils,
  sauvegarderProfil,
  supprimerSauvegarde,
  getMesSauvegardes
};