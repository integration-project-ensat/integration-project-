// services/profilCompetenceService.js
const prisma = require('../../prisma/client');
const { getSkillType, separateSkills, normalizeSkillCategory } = require('../utils/skillsLogic');

/**
 * Récupère toutes les compétences d'un étudiant (séparées tech/soft)
 */
async function getCompetences(userId) {
  const profils = await prisma.profilCompetence.findMany({
    where: { id_etudiant: userId },
    include: { competence: true },
    orderBy: { date_ajout: 'desc' },
  });
  const competences = profils.map(p => ({
    ...p.competence,
    niveau_maitrise: p.niveau_maitrise,
    date_ajout: p.date_ajout,
  }));
  return separateSkills(competences);
}

/**
 * Ajoute une seule compétence
 */
async function addCompetence(userId, data) {
  const categorie = normalizeSkillCategory(data.categorie, data.nom);
  let competence = await prisma.competence.findFirst({
    where: { nom: data.nom },
  });
  if (!competence) {
    competence = await prisma.competence.create({
      data: { nom: data.nom, categorie },
    });
  }
  return prisma.profilCompetence.create({
    data: {
      id_etudiant: userId,
      id_competence: competence.id_competence,
      niveau_maitrise: data.niveau_maitrise,
      date_ajout: new Date(),
    },
    include: { competence: true },
  });
}

/**
 * Ajoute plusieurs compétences d'un coup (bulk)
 */
async function addBulkCompetences(userId, competences) {
  const toCreate = [];
  for (const c of competences) {
    const categorie = normalizeSkillCategory(c.categorie, c.nom);
    let competence = await prisma.competence.findFirst({
      where: { nom: c.nom },
    });
    if (!competence) {
      competence = await prisma.competence.create({
        data: { nom: c.nom, categorie },
      });
    }
    toCreate.push({
      id_etudiant: userId,
      id_competence: competence.id_competence,
      niveau_maitrise: c.niveau_maitrise,
      date_ajout: new Date(),
    });
  }
  return prisma.profilCompetence.createMany({
    data: toCreate,
    skipDuplicates: true,
  });
}

/**
 * Modifie une compétence (appartient à l'utilisateur)
 */
async function updateCompetence(userId, competenceId, data) {
  const existing = await prisma.profilCompetence.findFirst({
    where: { id_etudiant: userId, id_competence: competenceId },
  });
  if (!existing) return null;

  return prisma.profilCompetence.update({
    where: { id_etudiant_id_competence: { id_etudiant: userId, id_competence: competenceId } },
    data: { niveau_maitrise: data.niveau_maitrise },
    include: { competence: true },
  });
}

/**
 * Supprime une compétence
 */
async function deleteCompetence(userId, competenceId) {
  const existing = await prisma.profilCompetence.findFirst({
    where: { id_etudiant: userId, id_competence: competenceId },
  });
  if (!existing) return null;

  return prisma.profilCompetence.delete({
    where: { id_etudiant_id_competence: { id_etudiant: userId, id_competence: competenceId } },
  });
}

/**
 * Suggestions de compétences (basées sur les projets/stages validés)
 */
async function getSuggestions(userId) {
  // Récupère les technologies des projets validés
  const projets = await prisma.projet.findMany({
    where: { id_etudiant: userId, statut: 'VALIDE' },
    include: {
      technologies: {
        include: { technologie: true },
      },
    },
  });

  const techSet = new Set();
  projets.forEach(p => p.technologies?.forEach(pt => techSet.add(pt.technologie.nom)));

  return Array.from(techSet).map(nom => ({
    nom,
    categorie: 'TECHNIQUE',
    source: 'suggestion',
  }));
}

module.exports = {
  getCompetences,
  addCompetence,
  addBulkCompetences,
  updateCompetence,
  deleteCompetence,
  getSuggestions,
};