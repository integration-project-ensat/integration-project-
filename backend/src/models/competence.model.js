const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const createCompetence = (data) =>
  prisma.competence.create({
    data: normalizeBigIntFields(data, ['id_competence']),
  })

const findAllCompetences = () =>
  prisma.competence.findMany()

const ajouterCompetenceUser = async (id_utilisateur, id_competence, niveau_maitrise) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) {
    throw new Error('Profil introuvable pour cet utilisateur')
  }

  return prisma.profilCompetence.upsert({
    where: {
      id_profil_id_competence: {
        id_profil: profil.id_profil,
        id_competence: toBigInt(id_competence),
      },
    },
    update: { niveau_maitrise },
    create: {
      id_profil: profil.id_profil,
      id_competence: toBigInt(id_competence),
      niveau_maitrise,
      date_ajout: new Date(),
    },
  })
}

const findCompetencesUser = async (id_utilisateur) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return []

  return prisma.profilCompetence.findMany({
    where: { id_profil: profil.id_profil },
    include: { competence: true },
  })
}

const supprimerCompetenceUser = async (id_utilisateur, id_competence) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return null

  return prisma.profilCompetence.delete({
    where: {
      id_profil_id_competence: {
        id_profil: profil.id_profil,
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
