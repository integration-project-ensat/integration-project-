const connexionService = require("../services/connexion.service");
const { ApiResponse } = require("../utils/apiResponse");

const connexionController = {
  async envoyerDemande(req, res) {
    try {
      const connexion = await connexionService.envoyerDemande(
        req.utilisateur.id_utilisateur,
        req.params.userId,
      );
      return res
        .status(201)
        .json(ApiResponse.created(connexion, "Demande de connexion envoyÃ©e"));
    } catch (e) {
      if (e.statusCode === 400)
        return res.status(400).json(ApiResponse.conflict(e.message));
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 409)
        return res.status(409).json(ApiResponse.conflict(e.message));
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getStatus(req, res) {
    try {
      const status = await connexionService.getStatus(
        req.utilisateur.id_utilisateur,
        req.params.userId,
      );
      return res.json(ApiResponse.success(status, "Statut de connexion rÃ©cupÃ©rÃ©"));
    } catch (e) {
      if (e.statusCode === 404)
        return res.status(404).json(ApiResponse.notFound("Utilisateur"));
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async accepter(req, res) {
    try {
      const connexion = await connexionService.changerStatut(
        req.params.id,
        req.utilisateur.id_utilisateur,
        "ACCEPTEE",
      );
      if (!connexion)
        return res.status(404).json(ApiResponse.notFound("Connexion"));
      return res.json(ApiResponse.success(connexion, "Connexion acceptÃ©e"));
    } catch (e) {
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 400)
        return res.status(400).json(ApiResponse.conflict(e.message));
      if (e.statusCode === 409)
        return res.status(409).json(ApiResponse.conflict(e.message));
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async refuser(req, res) {
    try {
      const connexion = await connexionService.changerStatut(
        req.params.id,
        req.utilisateur.id_utilisateur,
        "REFUSEE",
      );
      if (!connexion)
        return res.status(404).json(ApiResponse.notFound("Connexion"));
      return res.json(ApiResponse.success(connexion, "Connexion refusÃ©e"));
    } catch (e) {
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 400)
        return res.status(400).json(ApiResponse.conflict(e.message));
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getMine(req, res) {
    try {
      const connexions = await connexionService.findMine(
        req.utilisateur.id_utilisateur,
      );
      return res.json(ApiResponse.success(connexions, "Connexions rÃ©cupÃ©rÃ©es"));
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getMesDemandes(req, res) {
    try {
      const connexions = await connexionService.getMesDemandes(
        req.utilisateur.id_utilisateur,
      );
      return res.json(
        ApiResponse.success(connexions, "Mes demandes rÃ©cupÃ©rÃ©es"),
      );
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getDemandesRecues(req, res) {
    try {
      const connexions = await connexionService.getDemandesRecues(
        req.utilisateur.id_utilisateur,
      );
      return res.json(
        ApiResponse.success(connexions, "Demandes reÃ§ues rÃ©cupÃ©rÃ©es"),
      );
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getMesConnexions(req, res) {
    try {
      const connexions = await connexionService.getMesConnexions(
        req.utilisateur.id_utilisateur,
      );
      return res.json(
        ApiResponse.success(connexions, "Mes connexions rÃ©cupÃ©rÃ©es"),
      );
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async supprimerConnexion(req, res) {
    try {
      await connexionService.supprimerConnexion(
        req.params.id,
        req.utilisateur.id_utilisateur,
      );
      return res.json(
        ApiResponse.success(null, "Connexion supprimÃ©e avec succÃ¨s"),
      );
    } catch (e) {
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 404)
        return res.status(404).json(ApiResponse.notFound("Connexion"));
      if (e.statusCode === 422)
        return res.status(422).json(ApiResponse.conflict(e.message));
      return res.status(500).json(ApiResponse.serverError());
    }
  },
};

module.exports = connexionController;
