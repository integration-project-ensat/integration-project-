import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

export const createEtudiant = (data) =>
  prisma.etudiant.create({
    data: normalizeBigIntFields(data, ['id_utilisateur']),
  })

export const findEtudiantByUser = (id_utilisateur) =>
  prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: {
      utilisateur: true,
      profil: true,
      portfolio: true,
      github_integration: true,
      publications: true,
    },
  })

export const updateEtudiant = (id_utilisateur, data) =>
  prisma.etudiant.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data,
  })
