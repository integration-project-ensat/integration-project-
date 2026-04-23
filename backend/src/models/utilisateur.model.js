import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createUser = (data) =>
  prisma.utilisateur.create({ data })

export const findByEmail = (email) =>
  prisma.utilisateur.findUnique({ where: { email } })

export const findById = (id) =>
  prisma.utilisateur.findUnique({
    where: { id_utilisateur: id },
    include: {
      profil: true,
      etudiant: true,
      professeur: true,
      preference: true,
      score_credibilite: true,
      github_integration: true,
    }
  })

export const updateUser = (id, data) =>
  prisma.utilisateur.update({ where: { id_utilisateur: id }, data })

export const deleteUser = (id) =>
  prisma.utilisateur.delete({ where: { id_utilisateur: id } })

export const updateLastLogin = (id) =>
  prisma.utilisateur.update({
    where: { id_utilisateur: id },
    data: { derniere_connexion: new Date() }
  })