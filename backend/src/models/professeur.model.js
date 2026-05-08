const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const createProfesseur = (data) =>
  prisma.professeur.create({
    data: normalizeBigIntFields(data, ['id_utilisateur']),
  })

const findProfesseurByUser = (id_utilisateur) =>
  prisma.professeur.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: true },
  })

const updateProfesseur = (id_utilisateur, data) =>
  prisma.professeur.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data,
  })

const validerProfesseur = (id_utilisateur) =>
  prisma.professeur.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: true },
  })

module.exports = {
  createProfesseur,
  findProfesseurByUser,
  updateProfesseur,
  validerProfesseur,
}
