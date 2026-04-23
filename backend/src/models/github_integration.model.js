import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const upsertGithubIntegration = (id_utilisateur, data) =>
  prisma.githubIntegration.upsert({
    where: { id_utilisateur },
    update: { ...data, date_synchronisation: new Date() },
    create: { id_utilisateur, ...data }
  })

export const findGithubIntegration = (id_utilisateur) =>
  prisma.githubIntegration.findUnique({ where: { id_utilisateur } })
