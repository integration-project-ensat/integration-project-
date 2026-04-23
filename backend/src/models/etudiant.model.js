import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createEtudiant = (data) =>
  prisma.etudiant.create({ data })

export const findEtudiantByUser = (id_utilisateur) =>
  prisma.etudiant.findUnique({
    where: { id_utilisateur },
    include: { utilisateur: true }
  })

export const updateEtudiant = (id_element, data) =>
  prisma.etudiant.update({ where: { id_element }, data })
