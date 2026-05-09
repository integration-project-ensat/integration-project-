const technologieService = require("../services/technologie.service");
const { ApiResponse } = require("../utils/apiResponse");
const { getPaginationParams, buildPaginationMeta } = require("../utils/pagination");



/**
 * GET /technologies
 * Récupérer toutes les technologies (avec filtres optionnels)
 * Accessible à tous les utilisateurs authentifiés
 */
const getAllTechnologies = async (req, res) => {
  try {
    const { categorie, search } = req.query;
    const { page, limit } = getPaginationParams(req);

    const toutes = await technologieService.getAllTechnologies({
      categorie,
      search,
      valideesSeulement: true,
    });

    // Pagination manuelle sur le résultat
    const total = toutes.length;
    const data  = toutes.slice((page - 1) * limit, page * limit);

    return res.status(200).json(
      ApiResponse.paginated(
        data,
        buildPaginationMeta(page, limit, total),
        "Technologies récupérées avec succès"
      )
    );
  } catch (error) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

/**
 * GET /technologies/:id
 * Récupérer une technologie par son ID
 */
const getTechnologieById = async (req, res) => {
  try {
    const technologie = await technologieService.getTechnologieById(req.params.id);

    if (!technologie) {
      return res.status(404).json(ApiResponse.notFound("Technologie"));
    }

    return res.status(200).json(ApiResponse.success(technologie));
  } catch (error) {
    return res.status(500).json(ApiResponse.serverError());
  }
};

/**
 * POST /technologies
 * Créer une nouvelle technologie — réservé ADMIN
 */
const createTechnologie = async (req, res) => {
  try {
    const { nom, categorie, est_validee } = req.body;

    if (!nom) {
      return res.status(400).json(
        ApiResponse.validationError({ nom: ["Le nom de la technologie est requis"] })
      );
    }

    const technologie = await technologieService.createTechnologie({
      nom,
      categorie,
      est_validee,
    });

    return res.status(201).json(
      ApiResponse.created(technologie, "Technologie ajoutée au catalogue avec succès")
    );
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json(ApiResponse.conflict(error.message));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

/**
 * PATCH /technologies/:id
 * Mettre à jour une technologie — réservé ADMIN
 */
const updateTechnologie = async (req, res) => {
  try {
    const updated = await technologieService.updateTechnologie(
      req.params.id,
      req.body
    );

    return res.status(200).json(
      ApiResponse.success(updated, "Technologie mise à jour avec succès")
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json(ApiResponse.notFound("Technologie"));
    }
    if (error.statusCode === 409) {
      return res.status(409).json(ApiResponse.conflict(error.message));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

/**
 * DELETE /technologies/:id
 * Supprimer une technologie — réservé ADMIN
 */
const deleteTechnologie = async (req, res) => {
  try {
    await technologieService.deleteTechnologie(req.params.id);

    return res.status(200).json(
      ApiResponse.success(null, "Technologie supprimée du catalogue avec succès")
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json(ApiResponse.notFound("Technologie"));
    }
    if (error.statusCode === 409) {
      return res.status(409).json(ApiResponse.conflict(error.message));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

/**
 * PATCH /technologies/:id/valider
 * Valider une technologie détectée automatiquement — réservé ADMIN
 */
const validerTechnologie = async (req, res) => {
  try {
    const updated = await technologieService.validerTechnologie(req.params.id);

    return res.status(200).json(
      ApiResponse.success(updated, "Technologie validée avec succès")
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json(ApiResponse.notFound("Technologie"));
    }
    return res.status(500).json(ApiResponse.serverError());
  }
};

module.exports = {
  getAllTechnologies,
  getTechnologieById,
  createTechnologie,
  updateTechnologie,
  deleteTechnologie,
  validerTechnologie,
};
