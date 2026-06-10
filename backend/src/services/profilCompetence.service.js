// services/profilCompetenceService.js
const prisma = require('../../prisma/client');
const { separateSkills } = require('../utils/skillsLogic');
const { recalculerScore } = require('./score.service');

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
  // Mode : lier une compétence existante par id
  const competence = await prisma.profilCompetence.create({
    data: {
      id_etudiant: userId,
      id_competence: BigInt(data.id_competence),
      niveau_maitrise: data.niveau_maitrise ?? null,
      date_ajout: new Date(),
    },
    include: { competence: true },
  });

  await recalculerScore(userId);

  return competence;
}

/**
 * Ajoute plusieurs compétences d'un coup (bulk)
 */
async function addBulkCompetences(userId, competences) {
  const toCreate = competences.map(c => ({
    id_etudiant: userId,
    id_competence: BigInt(c.id_competence),
    niveau_maitrise: c.niveau_maitrise ?? null,
    date_ajout: new Date(),
  }));

  const result = await prisma.profilCompetence.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  await recalculerScore(userId);

  return result;
}
/**
 * Modifie une compétence (appartient à l'utilisateur)
 */
async function updateCompetence(userId, competenceId, data) {
  const existing = await prisma.profilCompetence.findFirst({
    where: { id_etudiant: userId, id_competence: competenceId },
  });
  if (!existing) return null;

  const competence = await prisma.profilCompetence.update({
    where: { id_etudiant_id_competence: { id_etudiant: userId, id_competence: competenceId } },
    data: { niveau_maitrise: data.niveau_maitrise },
    include: { competence: true },
  });

  await recalculerScore(userId);

  return competence;
}

/**
 * Supprime une compétence
 */
async function deleteCompetence(userId, competenceId) {
  const existing = await prisma.profilCompetence.findFirst({
    where: { id_etudiant: userId, id_competence: competenceId },
  });
  if (!existing) return null;

  const competence = await prisma.profilCompetence.delete({
    where: { id_etudiant_id_competence: { id_etudiant: userId, id_competence: competenceId } },
  });

  await recalculerScore(userId);

  return competence;
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
