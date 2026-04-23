import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createCompetence = (data) =>
  prisma.competence.create({ data })

export const findAllCompetences = () =>
  prisma.competence.findMany()

export const ajouterCompetenceUser = (id_utilisateur, id_competence, niveau) =>
  prisma.utilisateurCompetence.upsert({
    where: { id_utilisateur_id_competence: { id_utilisateur, id_competence } },
    update: { niveau },
    create: { id_utilisateur, id_competence, niveau }
  })

export const findCompetencesUser = (id_utilisateur) =>
  prisma.utilisateurCompetence.findMany({
    where: { id_utilisateur },
    include: { competence: true }
  })

export const supprimerCompetenceUser = (id_utilisateur, id_competence) =>
  prisma.utilisateurCompetence.delete({
    where: { id_utilisateur_id_competence: { id_utilisateur, id_competence } }
  })
