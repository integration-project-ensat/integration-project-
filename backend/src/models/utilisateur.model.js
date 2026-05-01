import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const USER_ID_FIELDS = ['id_utilisateur']

export const createUser = (data) =>
  prisma.utilisateur.create({ data: normalizeBigIntFields(data, USER_ID_FIELDS) })

export const findByEmail = (email) =>
  prisma.utilisateur.findUnique({ where: { email } })

export const findById = (id) =>
  prisma.utilisateur.findUnique({
    where: { id_utilisateur: toBigInt(id) },
    include: {
      etudiant: {
        include: {
          profil: true,
          portfolio: true,
          github_integration: true,
        },
      },
      professeur: true,
      professionnel: true,
      administrateur: true,
      notifications: true,
    },
  })

export const updateUser = (id, data) =>
  prisma.utilisateur.update({
    where: { id_utilisateur: toBigInt(id) },
    data,
  })

export const deleteUser = (id) =>
  prisma.utilisateur.delete({ where: { id_utilisateur: toBigInt(id) } })

export const updateLastLogin = (id) =>
  prisma.utilisateur.update({
    where: { id_utilisateur: toBigInt(id) },
    data: { derniere_connexion: new Date() },
  })
