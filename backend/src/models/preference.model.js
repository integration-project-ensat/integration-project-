import { prisma, toBigInt } from './prisma.js'

export const upsertPreference = (id_utilisateur, data) =>
  prisma.profil.upsert({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    update: data,
    create: {
      id_utilisateur: toBigInt(id_utilisateur),
      ...data,
    },
  })

export const findPreference = (id_utilisateur) =>
  prisma.profil.findUnique({ where: { id_utilisateur: toBigInt(id_utilisateur) } })
