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
        .json(ApiResponse.created(connexion, "Demande de connexion envoyée"));
    } catch (e) {
      if (e.statusCode === 400)
        return res.status(400).json(ApiResponse.error(e.message));
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 409)
        return res.status(409).json(ApiResponse.error(e.message));
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
      return res.json(ApiResponse.success(connexion, "Connexion acceptée"));
    } catch (e) {
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 400)
        return res.status(400).json(ApiResponse.error(e.message));
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
      return res.json(ApiResponse.success(connexion, "Connexion refusée"));
    } catch (e) {
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 400)
        return res.status(400).json(ApiResponse.error(e.message));
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getMine(req, res) {
    try {
      let connexions = await connexionService.findMine(
        req.utilisateur.id_utilisateur,
      );

      if (!connexions.length && process.env.NODE_ENV !== "production") {
        await connexionService.ensureSampleConnexions(
          req.utilisateur.id_utilisateur,
          req.utilisateur.role,
          req.utilisateur.email,
        );
        connexions = await connexionService.findMine(
          req.utilisateur.id_utilisateur,
        );
      }

      return res.json(ApiResponse.success(connexions, "Connexions récupérées"));
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getMesDemandes(req, res) {
    try {
      let connexions = await connexionService.getMesDemandes(
        req.utilisateur.id_utilisateur,
      );

      if (!connexions.length && process.env.NODE_ENV !== "production") {
        await connexionService.ensureSampleConnexions(
          req.utilisateur.id_utilisateur,
          req.utilisateur.role,
          req.utilisateur.email,
        );
        connexions = await connexionService.getMesDemandes(
          req.utilisateur.id_utilisateur,
        );
      }

      return res.json(
        ApiResponse.success(connexions, "Mes demandes récupérées"),
      );
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getDemandesRecues(req, res) {
    try {
      let connexions = await connexionService.getDemandesRecues(
        req.utilisateur.id_utilisateur,
      );

      if (!connexions.length && process.env.NODE_ENV !== "production") {
        await connexionService.ensureSampleConnexions(
          req.utilisateur.id_utilisateur,
          req.utilisateur.role,
          req.utilisateur.email,
        );
        connexions = await connexionService.getDemandesRecues(
          req.utilisateur.id_utilisateur,
        );
      }

      return res.json(
        ApiResponse.success(connexions, "Demandes reçues récupérées"),
      );
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError());
    }
  },

  async getMesConnexions(req, res) {
    try {
      let connexions = await connexionService.getMesConnexions(
        req.utilisateur.id_utilisateur,
      );

      if (!connexions.length && process.env.NODE_ENV !== "production") {
        await connexionService.ensureSampleConnexions(
          req.utilisateur.id_utilisateur,
          req.utilisateur.role,
          req.utilisateur.email,
        );
        connexions = await connexionService.getMesConnexions(
          req.utilisateur.id_utilisateur,
        );
      }

      return res.json(
        ApiResponse.success(connexions, "Mes connexions récupérées"),
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
        ApiResponse.success(null, "Connexion supprimée avec succès"),
      );
    } catch (e) {
      if (e.statusCode === 403)
        return res.status(403).json(ApiResponse.forbidden());
      if (e.statusCode === 404)
        return res.status(404).json(ApiResponse.notFound("Connexion"));
      if (e.statusCode === 422)
        return res.status(422).json(ApiResponse.error(e.message));
      return res.status(500).json(ApiResponse.serverError());
    }
  },
};

module.exports = connexionController;
