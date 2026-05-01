import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

export const createProfesseur = (data) =>
  prisma.professeur.create({
    data: normalizeBigIntFields(data, ['id_utilisateur']),
  })

export const findProfesseurByUser = (id_utilisateur) =>
  prisma.professeur.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: true },
  })

export const updateProfesseur = (id_utilisateur, data) =>
  prisma.professeur.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data,
  })

export const validerProfesseur = (id_utilisateur) =>
  prisma.professeur.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: true },
  })
