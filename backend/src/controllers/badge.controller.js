const asyncHandler = require('../middlewares/asyncHandler');
const badgeService = require('../services/badge.service');

const creerBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.creerBadge(req.body);

  res.status(201).json({
    success: true,
    message: 'Badge créé avec succès',
    data: badge
  });
});

const getBadges = asyncHandler(async (req, res) => {
  const badges = await badgeService.getBadges();

  res.json({
    success: true,
    count: badges.length,
    data: badges
  });
});

const getAllBadgesAdmin = asyncHandler(async (req, res) => {
  const badges = await badgeService.getAllBadgesAdmin();

  res.json({
    success: true,
    count: badges.length,
    data: badges
  });
});

const modifierBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.modifierBadge(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Badge modifié avec succès',
    data: badge
  });
});

const supprimerBadge = asyncHandler(async (req, res) => {
  await badgeService.supprimerBadge(req.params.id);

  res.json({
    success: true,
    message: 'Badge supprimé avec succès'
  });
});

const getMesBadges = asyncHandler(async (req, res) => {
  const badges = await badgeService.getMesBadges(req.utilisateur.id_utilisateur);

  res.json({
    success: true,
    count: badges.length,
    data: badges
  });
});

const evaluerMesBadges = asyncHandler(async (req, res) => {
  const badges = await badgeService.evaluerEtAttribuerBadges(
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Évaluation des badges terminée',
    nouveaux_badges: badges.length,
    data: badges
  });
});

const evaluerBadgesEtudiant = asyncHandler(async (req, res) => {
  const badges = await badgeService.evaluerEtAttribuerBadges(req.params.id);

  res.json({
    success: true,
    message: 'Évaluation des badges de l’étudiant terminée',
    nouveaux_badges: badges.length,
    data: badges
  });
});

module.exports = {
  creerBadge,
  getBadges,
  getAllBadgesAdmin,
  modifierBadge,
  supprimerBadge,
  getMesBadges,
  evaluerMesBadges,
  evaluerBadgesEtudiant
};