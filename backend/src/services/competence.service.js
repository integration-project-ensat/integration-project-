const { prisma, toBigInt } = require("../models/prisma");

/**
 * SCRUM-87 — Competence Reference Service
 * Gère le catalogue global des compétences (table `competences`).
 * Ce service ne touche PAS aux compétences d'un étudiant (profil_competence),
 * il expose uniquement le référentiel depuis lequel l'étudiant peut choisir.
 */

/**
 * Récupérer toutes les compétences du catalogue
 * Utilisé dans E5 pour afficher les suggestions à l'étudiant
 */
const getAllCompetences = async ({ categorie, search } = {}) => {
  const where = {};

  if (categorie) {
    where.categorie = categorie; // "TECHNIQUE" | "SOFT"
  }

  if (search) {
    where.nom = {
      contains: search,
      mode: "insensitive",
    };
  }

  const competences = await prisma.competence.findMany({
    where,
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
  });

  return competences;
};

/**
 * Récupérer une compétence par son ID
 */
const getCompetenceById = async (id) => {
  const competence = await prisma.competence.findUnique({
    where: { id_competence: toBigInt(id) },
  });

  return competence;
};

/**
 * Récupérer les compétences suggérées pour un étudiant
 * Retourne les compétences du catalogue que l'étudiant n'a pas encore ajoutées
 * Utilisé dans E5 — "Ajouter des compétences"
 */
const getSuggestionsForEtudiant = async (etudiantId) => {
  // Récupérer le profil de l'étudiant
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(etudiantId) },
    select: { id_profil: true },
  });

  if (!profil) return [];

  // Compétences déjà ajoutées par l'étudiant
  const dejAjoutees = await prisma.profilCompetence.findMany({
    where: { id_profil: profil.id_profil },
    select: { id_competence: true },
  });

  const idsDejaAjoutees = dejAjoutees.map((pc) => pc.id_competence);

  // Retourner uniquement celles qui ne sont pas encore dans son profil
  const suggestions = await prisma.competence.findMany({
    where: {
      id_competence: { notIn: idsDejaAjoutees },
    },
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
  });

  return suggestions;
};

/**
 * Créer une nouvelle compétence dans le catalogue (admin)
 */
const createCompetence = async ({ nom, categorie, niveau }) => {
  // Vérifier si la compétence existe déjà
  const existing = await prisma.competence.findFirst({
    where: { nom: { equals: nom, mode: "insensitive" } },
  });

  if (existing) {
    const error = new Error("Cette compétence existe déjà dans le catalogue");
    error.statusCode = 409;
    throw error;
  }

  const competence = await prisma.competence.create({
    data: { nom, categorie, niveau },
  });

  return competence;
};

/**
 * Mettre à jour une compétence du catalogue (admin)
 */
const updateCompetence = async (id, { nom, categorie, niveau }) => {
  const existing = await prisma.competence.findUnique({
    where: { id_competence: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Compétence introuvable");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.competence.update({
    where: { id_competence: toBigInt(id) },
    data: {
      ...(nom && { nom }),
      ...(categorie && { categorie }),
      ...(niveau && { niveau }),
    },
  });

  return updated;
};

/**
 * Supprimer une compétence du catalogue (admin)
 */
const deleteCompetence = async (id) => {
  const existing = await prisma.competence.findUnique({
    where: { id_competence: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Compétence introuvable");
    error.statusCode = 404;
    throw error;
  }

  await prisma.competence.delete({
    where: { id_competence: toBigInt(id) },
  });
};

module.exports = {
  getAllCompetences,
  getCompetenceById,
  getSuggestionsForEtudiant,
  createCompetence,
  updateCompetence,
  deleteCompetence,
};
