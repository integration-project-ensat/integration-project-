import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createProfesseur = (data) =>
  prisma.professeur.create({ data })

export const findProfesseurByUser = (id_utilisateur) =>
  prisma.professeur.findUnique({
    where: { id_utilisateur },
    include: { utilisateur: true }
  })

export const updateProfesseur = (id_element, data) =>
  prisma.professeur.update({ where: { id_element }, data })

export const validerProfesseur = (id_element) =>
  prisma.professeur.update({
    where: { id_element },
    data: { date_validation: new Date() }
  })
