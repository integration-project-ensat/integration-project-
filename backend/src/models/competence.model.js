import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

export const createCompetence = (data) =>
  prisma.competence.create({
    data: normalizeBigIntFields(data, ['id_competence']),
  })

export const findAllCompetences = () =>
  prisma.competence.findMany()

export const ajouterCompetenceUser = async (id_utilisateur, id_competence, niveau_maitrise) => {
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

export const findCompetencesUser = async (id_utilisateur) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return []

  return prisma.profilCompetence.findMany({
    where: { id_profil: profil.id_profil },
    include: { competence: true },
  })
}

export const supprimerCompetenceUser = async (id_utilisateur, id_competence) => {
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
