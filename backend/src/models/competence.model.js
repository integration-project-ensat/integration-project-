const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')
const { normalizeSkillCategory } = require('../utils/skillsLogic')

const createCompetence = (data) =>
  prisma.competence.create({
    data: normalizeBigIntFields(
      {
        ...data,
        categorie: normalizeSkillCategory(data.categorie, data.nom),
      },
      ['id_competence']
    ),
  })

const findAllCompetences = () =>
  prisma.competence.findMany()

const ajouterCompetenceUser = async (id_utilisateur, id_competence, niveau_maitrise) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) {
    throw new Error('Etudiant introuvable pour cet utilisateur')
  }

  return prisma.profilCompetence.upsert({
    where: {
      id_etudiant_id_competence: {
        id_etudiant: etudiant.id_utilisateur,
        id_competence: toBigInt(id_competence),
      },
    },
    update: { niveau_maitrise },
    create: {
      id_etudiant: etudiant.id_utilisateur,
      id_competence: toBigInt(id_competence),
      niveau_maitrise,
      date_ajout: new Date(),
    },
  })
}

const findCompetencesUser = async (id_utilisateur) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) return []

  return prisma.profilCompetence.findMany({
    where: { id_etudiant: etudiant.id_utilisateur },
    include: { competence: true },
  })
}

const supprimerCompetenceUser = async (id_utilisateur, id_competence) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) return null

  return prisma.profilCompetence.delete({
    where: {
      id_etudiant_id_competence: {
        id_etudiant: etudiant.id_utilisateur,
        id_competence: toBigInt(id_competence),
      },
    },
  })
}

module.exports = {
  createCompetence,
  findAllCompetences,
  ajouterCompetenceUser,
  findCompetencesUser,
  supprimerCompetenceUser,
}
