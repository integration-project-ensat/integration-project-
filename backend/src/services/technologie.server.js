const { prisma, toBigInt } = require("../models/prisma");

/**
 * SCRUM-88 — TechnologieService
 * Gère le catalogue global des technologies (table `technologies`).
 * Utilisé pour remplir le formulaire de soumission de projet (E1)
 * et pour l'import GitHub (E7/E8).
 */

/**
 * Récupérer toutes les technologies du catalogue
 * Filtre optionnel par catégorie ou recherche par nom
 */
const getAllTechnologies = async ({ categorie, search, valideesSeulement = true } = {}) => {
  const where = {};

  if (valideesSeulement) {
    where.est_validee = true;
  }

  if (categorie) {
    where.categorie = { equals: categorie, mode: "insensitive" };
  }

  if (search) {
    where.nom = { contains: search, mode: "insensitive" };
  }

  const technologies = await prisma.technologie.findMany({
    where,
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
  });

  return technologies;
};

/**
 * Récupérer une technologie par son ID
 */
const getTechnologieById = async (id) => {
  const technologie = await prisma.technologie.findUnique({
    where: { id_technologie: toBigInt(id) },
  });

  return technologie;
};

/**
 * Récupérer une technologie par son nom (utile pour l'import GitHub)
 * Crée la technologie si elle n'existe pas encore — "find or create"
 */
const findOrCreateByNom = async (nom, categorie = null) => {
  const existing = await prisma.technologie.findUnique({
    where: { nom },
  });

  if (existing) return existing;

  // Nouvelle technologie détectée (ex: depuis GitHub) — non validée par défaut
  const created = await prisma.technologie.create({
    data: {
      nom,
      categorie,
      est_validee: false, // l'admin doit la valider
    },
  });

  return created;
};

/**
 * Créer une nouvelle technologie dans le catalogue (admin)
 */
const createTechnologie = async ({ nom, categorie, est_validee = true }) => {
  const existing = await prisma.technologie.findUnique({ where: { nom } });

  if (existing) {
    const error = new Error("Cette technologie existe déjà dans le catalogue");
    error.statusCode = 409;
    throw error;
  }

  const technologie = await prisma.technologie.create({
    data: { nom, categorie, est_validee },
  });

  return technologie;
};

/**
 * Mettre à jour une technologie (admin)
 */
const updateTechnologie = async (id, { nom, categorie, est_validee }) => {
  const existing = await prisma.technologie.findUnique({
    where: { id_technologie: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Technologie introuvable");
    error.statusCode = 404;
    throw error;
  }

  // Vérifier unicité du nom si on le change
  if (nom && nom !== existing.nom) {
    const nomPris = await prisma.technologie.findUnique({ where: { nom } });
    if (nomPris && nomPris.id_technologie !== existing.id_technologie) {
      const error = new Error("Ce nom de technologie est déjà utilisé");
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.technologie.update({
    where: { id_technologie: toBigInt(id) },
    data: {
      ...(nom !== undefined && { nom }),
      ...(categorie !== undefined && { categorie }),
      ...(est_validee !== undefined && { est_validee }),
    },
  });

  return updated;
};

/**
 * Supprimer une technologie du catalogue (admin)
 */
const deleteTechnologie = async (id) => {
  const existing = await prisma.technologie.findUnique({
    where: { id_technologie: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Technologie introuvable");
    error.statusCode = 404;
    throw error;
  }

  // Vérifier si elle est utilisée dans des projets
  const utilisee = await prisma.projetTechnologie.findFirst({
    where: { id_technologie: toBigInt(id) },
  });

  if (utilisee) {
    const error = new Error(
      "Cette technologie est utilisée dans des projets existants et ne peut pas être supprimée"
    );
    error.statusCode = 409;
    throw error;
  }

  await prisma.technologie.delete({
    where: { id_technologie: toBigInt(id) },
  });
};

/**
 * Valider une technologie détectée automatiquement (ex: depuis GitHub)
 * Passe est_validee de false à true
 */
const validerTechnologie = async (id) => {
  const existing = await prisma.technologie.findUnique({
    where: { id_technologie: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Technologie introuvable");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.technologie.update({
    where: { id_technologie: toBigInt(id) },
    data: { est_validee: true },
  });

  return updated;
};

module.exports = {
  getAllTechnologies,
  getTechnologieById,
  findOrCreateByNom,
  createTechnologie,
  updateTechnologie,
  deleteTechnologie,
  validerTechnologie,
};