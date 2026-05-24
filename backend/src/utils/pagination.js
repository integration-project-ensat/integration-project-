const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}


/**
 * Extrait et valide les paramètres de pagination depuis la requête Express.
 *
 * example:
 * // GET /projets?page=2&limit=20
 * const { page, limit, skip } = getPaginationParams(req);
 * const projets = await prisma.projet.findMany({ skip, take: limit });
 */

function getPaginationParams(req) {
  const page = parsePositiveInteger(req.query?.page, DEFAULT_PAGE);
  const requestedLimit = parsePositiveInteger(req.query?.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}


/**
 * Construit l'objet meta de pagination à inclure dans la réponse API.
 *
 * example:
 * const meta = buildPaginationMeta(page, limit, total);
 * return ApiResponse.paginated(data, meta);
 */

function buildPaginationMeta(page, limit, total) {
  const safeTotal = Math.max(Number(total) || 0, 0);
  const totalPages = Math.ceil(safeTotal / limit);

  return {
    page,
    limit,
    total: safeTotal,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}


/**
 * Helper Prisma — retourne { skip, take } prêt à passer à findMany.
 *
 * example:
 * const projets = await prisma.projet.findMany({
 *   ...prismaPageArgs(page, limit),
 *   where: { id_etudiant: etudiantId },
 * });
 */


function prismaPageArgs(page, limit) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}


/**
 * Combine data + meta en un seul objet paginé.
 *
 * example:
 * const [data, total] = await Promise.all([
 *   prisma.projet.findMany({ ...prismaPageArgs(page, limit), where }),
 *   prisma.projet.count({ where }),
 * ]);
 * return buildPaginatedResult(data, page, limit, total);
 */

function buildPaginatedResult(data, page, limit, total) {
  return {
    data,
    meta: buildPaginationMeta(page, limit, total),
  };
}

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  getPaginationParams,
  buildPaginationMeta,
  prismaPageArgs,
  buildPaginatedResult,
};