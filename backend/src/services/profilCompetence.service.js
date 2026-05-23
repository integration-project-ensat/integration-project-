const prisma = require('../models/prisma')

async function getCompetences(utilisateurId) {
  return prisma.profilCompetence.findMany({
    where: { id_etudiant: BigInt(utilisateurId) },
    include: { competence: true },
    orderBy: { date_ajout: 'desc' }
  })
}

async function getSuggestions(utilisateurId) {
  const dejaAjoutees = await prisma.profilCompetence.findMany({
    where: { id_etudiant: BigInt(utilisateurId) },
    select: { id_competence: true }
  })
  const ids = dejaAjoutees.map(c => c.id_competence)
  return prisma.competence.findMany({
    where: { id_competence: { notIn: ids } },
    take: 10,
    orderBy: { nom: 'asc' }
  })
}

async function addCompetence(utilisateurId, { id_competence, niveau_maitrise }) {
  return prisma.profilCompetence.create({
    data: {
      id_etudiant: BigInt(utilisateurId),
      id_competence: BigInt(id_competence),
      niveau_maitrise: niveau_maitrise ?? null,
      date_ajout: new Date()
    },
    include: { competence: true }
  })
}

async function addBulkCompetences(utilisateurId, competences) {
  const data = competences.map(c => ({
    id_etudiant: BigInt(utilisateurId),
    id_competence: BigInt(c.id_competence),
    niveau_maitrise: c.niveau_maitrise ?? null,
    date_ajout: new Date()
  }))
  return prisma.profilCompetence.createMany({ data, skipDuplicates: true })
}

async function updateCompetence(utilisateurId, id_competence, { niveau_maitrise }) {
  const existant = await prisma.profilCompetence.findUnique({
    where: {
      id_etudiant_id_competence: {
        id_etudiant: BigInt(utilisateurId),
        id_competence: BigInt(id_competence)
      }
    }
  })
  if (!existant) return null

  return prisma.profilCompetence.update({
    where: {
      id_etudiant_id_competence: {
        id_etudiant: BigInt(utilisateurId),
        id_competence: BigInt(id_competence)
      }
    },
    data: { niveau_maitrise },
    include: { competence: true }
  })
}

async function deleteCompetence(utilisateurId, id_competence) {
  const existant = await prisma.profilCompetence.findUnique({
    where: {
      id_etudiant_id_competence: {
        id_etudiant: BigInt(utilisateurId),
        id_competence: BigInt(id_competence)
      }
    }
  })
  if (!existant) return null

  return prisma.profilCompetence.delete({
    where: {
      id_etudiant_id_competence: {
        id_etudiant: BigInt(utilisateurId),
        id_competence: BigInt(id_competence)
      }
    }
  })
}

module.exports = { getCompetences, getSuggestions, addCompetence, addBulkCompetences, updateCompetence, deleteCompetence }