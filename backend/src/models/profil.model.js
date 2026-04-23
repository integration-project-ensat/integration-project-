import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const upsertProfil = (id_utilisateur, data) =>
  prisma.profil.upsert({
    where: { id_utilisateur },
    update: data,
    create: { id_utilisateur, ...data }
  })

export const findProfil = (id_utilisateur) =>
  prisma.profil.findUnique({ where: { id_utilisateur } })
