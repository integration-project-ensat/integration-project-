const { prisma, toBigInt } = require("../models/prisma");
const { normalizeSkillCategory, separateSkills } = require("../utils/skillsLogic");

/**
 * SCRUM-87 - Competence Reference Service
 * Gere le catalogue global des competences (table `competences`).
 * Ce service ne touche aux competences d'un etudiant que pour filtrer
 * les suggestions deja ajoutees dans `profil_competence`.
 */

const getAllCompetences = async ({ categorie, search } = {}) => {
  const where = {};

  if (categorie) {
    where.categorie = normalizeSkillCategory(categorie);
  }

  if (search) {
    where.nom = {
      contains: search,
      mode: "insensitive",
    };
  }

  return prisma.competence.findMany({
    where,
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
  });
};

const getCompetencesByType = async ({ search } = {}) => {
  const competences = await getAllCompetences({ search });
  return separateSkills(competences);
};

const getCompetenceById = async (id) => {
  return prisma.competence.findUnique({
    where: { id_competence: toBigInt(id) },
  });
};

const getSuggestionsForEtudiant = async (etudiantId) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(etudiantId) },
    select: { id_utilisateur: true },
  });

  if (!etudiant) return [];

  const dejaAjoutees = await prisma.profilCompetence.findMany({
    where: { id_etudiant: etudiant.id_utilisateur },
    select: { id_competence: true },
  });

  const idsDejaAjoutees = dejaAjoutees.map((pc) => pc.id_competence);

  return prisma.competence.findMany({
    where: {
      id_competence: { notIn: idsDejaAjoutees },
    },
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
  });
};

const createCompetence = async ({ nom, categorie, niveau }) => {
  const normalizedCategorie = normalizeSkillCategory(categorie, nom);

  const existing = await prisma.competence.findFirst({
    where: { nom: { equals: nom, mode: "insensitive" } },
  });

  if (existing) {
    const error = new Error("Cette competence existe deja dans le catalogue");
    error.statusCode = 409;
    throw error;
  }

  return prisma.competence.create({
    data: { nom, categorie: normalizedCategorie, niveau },
  });
};

const updateCompetence = async (id, { nom, categorie, niveau }) => {
  const existing = await prisma.competence.findUnique({
    where: { id_competence: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Competence introuvable");
    error.statusCode = 404;
    throw error;
  }

  const data = {};

  if (nom) data.nom = nom;
  if (categorie || nom) data.categorie = normalizeSkillCategory(categorie, nom || existing.nom);
  if (niveau) data.niveau = niveau;

  return prisma.competence.update({
    where: { id_competence: toBigInt(id) },
    data,
  });
};

const deleteCompetence = async (id) => {
  const existing = await prisma.competence.findUnique({
    where: { id_competence: toBigInt(id) },
  });

  if (!existing) {
    const error = new Error("Competence introuvable");
    error.statusCode = 404;
    throw error;
  }

  await prisma.competence.delete({
    where: { id_competence: toBigInt(id) },
  });
};

module.exports = {
  getAllCompetences,
  getCompetencesByType,
  getCompetenceById,
  getSuggestionsForEtudiant,
  createCompetence,
  updateCompetence,
  deleteCompetence,
};
