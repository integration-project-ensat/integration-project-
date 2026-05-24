const asyncHandler = require('../middlewares/asyncHandler');
const connexionService = require('../services/connexion.service');

const envoyerDemande = asyncHandler(async (req, res) => {
  const connexion = await connexionService.envoyerDemande(
    req.utilisateur.id_utilisateur,
    req.params.userId
  );

  res.status(201).json({
    success: true,
    message: 'Demande de connexion envoyée',
    data: connexion
  });
});

const accepterDemande = asyncHandler(async (req, res) => {
  const connexion = await connexionService.accepterDemande(
    req.params.id,
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Demande de connexion acceptée',
    data: connexion
  });
});

const refuserDemande = asyncHandler(async (req, res) => {
  const connexion = await connexionService.refuserDemande(
    req.params.id,
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Demande de connexion refusée',
    data: connexion
  });
});

const getMesDemandes = asyncHandler(async (req, res) => {
  const connexions = await connexionService.getMesDemandes(req.utilisateur.id_utilisateur);

  res.json({
    success: true,
    count: connexions.length,
    data: connexions
  });
});

const getDemandesRecues = asyncHandler(async (req, res) => {
  const connexions = await connexionService.getDemandesRecues(req.utilisateur.id_utilisateur);

  res.json({
    success: true,
    count: connexions.length,
    data: connexions
  });
});

const getMesConnexions = asyncHandler(async (req, res) => {
  const connexions = await connexionService.getMesConnexions(req.utilisateur.id_utilisateur);

  res.json({
    success: true,
    count: connexions.length,
    data: connexions
  });
});

const supprimerConnexion = asyncHandler(async (req, res) => {
  await connexionService.supprimerConnexion(
    req.params.id,
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Connexion supprimée avec succès'
  });
});

module.exports = {
  envoyerDemande,
  accepterDemande,
  refuserDemande,
  getMesDemandes,
  getDemandesRecues,
  getMesConnexions,
  supprimerConnexion
};