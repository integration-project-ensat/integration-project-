const competenceService = require("../services/competence.service");
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

module.exports = {
  getAllCompetences,
  getCompetenceById,
  getSuggestionsForEtudiant,
  createCompetence,
  updateCompetence,
  deleteCompetence,
};
