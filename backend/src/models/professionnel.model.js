import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

export const createProfessionnel = (data) =>
  prisma.professionnel.create({
    data: normalizeBigIntFields(data, ['id_utilisateur']),
  })

export const findProfessionnelByUser = (id_utilisateur) =>
  prisma.professionnel.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: true },
  })

export const updateProfessionnel = (id_utilisateur, data) =>
  prisma.professionnel.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data,
  })

export const validerProfessionnel = (id_utilisateur) =>
  prisma.professionnel.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data: { est_valide_admin: true },
  })
