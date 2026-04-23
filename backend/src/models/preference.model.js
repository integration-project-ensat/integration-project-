import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const upsertPreference = (id_utilisateur, data) =>
  prisma.preference.upsert({
    where: { id_utilisateur },
    update: data,
    create: { id_utilisateur, ...data }
  })

export const findPreference = (id_utilisateur) =>
  prisma.preference.findUnique({ where: { id_utilisateur } })
