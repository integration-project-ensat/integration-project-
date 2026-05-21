const competenceService = require("../services/competence.service");
const profilCompetenceService = require("../services/profilCompetence.service");
const { ApiResponse } = require("../utils/apiResponse");
const { getPaginationParams, buildPaginationMeta } = require("../utils/pagination");

const getAllCompetences = async (req, res) => {
  try {
    const { categorie, search } = req.query;
    const { page, limit } = getPaginationParams(req);

    const toutes = await competenceService.getAllCompetences({ categorie, search });
    const total = toutes.length;
    const data = toutes.slice((page - 1) * limit, page * limit);

    return res.status(200).json(
      ApiResponse.paginated(
        data,
        buildPaginationMeta(page, limit, total),
        "Competences recuperees avec succes"
      )
    );
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json(ApiResponse.validationError({ categorie: [error.message] }));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

const getCompetencesByType = async (req, res) => {
  try {
    const { search } = req.query;
    const competences = await competenceService.getCompetencesByType({ search });

    return res.status(200).json(
      ApiResponse.success(competences, "Competences groupees par type avec succes")
    );
  } catch (error) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const getCompetenceById = async (req, res) => {
  try {
    const competence = await competenceService.getCompetenceById(req.params.id);

    if (!competence) {
      return res.status(404).json(ApiResponse.notFound("Competence"));
    }

    return res.status(200).json(ApiResponse.success(competence));
  } catch (error) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const getSuggestionsForEtudiant = async (req, res) => {
  try {
    const competences = await competenceService.getSuggestionsForEtudiant(req.params.etudiantId);
    return res.status(200).json(
      ApiResponse.success(competences, "Suggestions de competences recuperees avec succes")
    );
  } catch (error) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const createCompetence = async (req, res) => {
  try {
    const { nom, categorie, niveau } = req.body;

    if (!nom) {
      return res.status(400).json(
        ApiResponse.validationError({ nom: ["Le nom de la competence est requis"] })
      );
    }

    const competence = await competenceService.createCompetence({ nom, categorie, niveau });

    return res.status(201).json(
      ApiResponse.created(competence, "Competence ajoutee au catalogue avec succes")
    );
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json(ApiResponse.validationError({ categorie: [error.message] }));
    }
    if (error.statusCode === 409) {
      return res.status(409).json(ApiResponse.conflict(error.message));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

const updateCompetence = async (req, res) => {
  try {
    const competence = await competenceService.updateCompetence(req.params.id, req.body);
    return res.status(200).json(
      ApiResponse.success(competence, "Competence mise a jour avec succes")
    );
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json(ApiResponse.validationError({ categorie: [error.message] }));
    }
    if (error.statusCode === 404) {
      return res.status(404).json(ApiResponse.notFound("Competence"));
    }
    if (error.statusCode === 409) {
      return res.status(409).json(ApiResponse.conflict(error.message));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

const deleteCompetence = async (req, res) => {
  try {
    await competenceService.deleteCompetence(req.params.id);
    return res.status(200).json(
      ApiResponse.success(null, "Competence supprimee du catalogue avec succes")
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json(ApiResponse.notFound("Competence"));
    }
    if (error.statusCode === 409) {
      return res.status(409).json(ApiResponse.conflict(error.message));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

const getUserCompetences = async (req, res) => {
  try {
    const data = await profilCompetenceService.getCompetences(req.utilisateur.id_utilisateur);
    return res.status(200).json(ApiResponse.success(data, "Competences de l'utilisateur recuperees avec succes"));
  } catch (e) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const getUserSuggestions = async (req, res) => {
  try {
    const data = await profilCompetenceService.getSuggestions(req.utilisateur.id_utilisateur);
    return res.status(200).json(ApiResponse.success(data, "Suggestions de competences recuperees avec succes"));
  } catch (e) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const addUserCompetence = async (req, res) => {
  try {
    const competence = await profilCompetenceService.addCompetence(req.utilisateur.id_utilisateur, req.validatedData);
    return res.status(201).json(ApiResponse.created(competence, "Competence ajoutee au profil avec succes"));
  } catch (e) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const addBulkUserCompetences = async (req, res) => {
  try {
    const result = await profilCompetenceService.addBulkCompetences(
      req.utilisateur.id_utilisateur,
      req.validatedData.competences
    );
    return res.status(201).json(ApiResponse.created(result, "Competences ajoutees en bulk avec succes"));
  } catch (e) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const updateUserCompetence = async (req, res) => {
  try {
    const competenceId = BigInt(req.params.id);
    const updated = await profilCompetenceService.updateCompetence(
      req.utilisateur.id_utilisateur,
      competenceId,
      req.validatedData
    );
    if (!updated) return res.status(404).json(ApiResponse.notFound("Competence"));
    return res.status(200).json(ApiResponse.success(updated, "Competence mise a jour avec succes"));
  } catch (e) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

const removeUserCompetence = async (req, res) => {
  try {
    const competenceId = BigInt(req.params.id);
    const deleted = await profilCompetenceService.deleteCompetence(req.utilisateur.id_utilisateur, competenceId);
    if (!deleted) return res.status(404).json(ApiResponse.notFound("Competence"));
    return res.status(204).json(ApiResponse.success(null, "Competence supprimee du profil avec succes"));
  } catch (e) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

module.exports = {
  getAllCompetences,
  getCompetencesByType,
  getCompetenceById,
  getSuggestionsForEtudiant,
  createCompetence,
  updateCompetence,
  deleteCompetence,
  getUserCompetences,
  getUserSuggestions,
  addUserCompetence,
  addBulkUserCompetences,
  updateUserCompetence,
  removeUserCompetence,
};