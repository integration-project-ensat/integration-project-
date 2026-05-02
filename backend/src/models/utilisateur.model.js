const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const USER_ID_FIELDS = ['id_utilisateur']

const createUser = (data) =>
  prisma.utilisateur.create({ data: normalizeBigIntFields(data, USER_ID_FIELDS) })

const findByEmail = (email) =>
  prisma.utilisateur.findUnique({ where: { email } })

const findById = (id) =>
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

const updateUser = (id, data) =>
  prisma.utilisateur.update({
    where: { id_utilisateur: toBigInt(id) },
    data,
  })

const deleteUser = (id) =>
  prisma.utilisateur.delete({ where: { id_utilisateur: toBigInt(id) } })

const updateLastLogin = (id) =>
  prisma.utilisateur.update({
    where: { id_utilisateur: toBigInt(id) },
    data: { derniere_connexion: new Date() },
  })

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateUser,
  deleteUser,
  updateLastLogin,
}
