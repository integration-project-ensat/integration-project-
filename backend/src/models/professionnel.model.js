const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const createProfessionnel = (data) =>
  prisma.professionnel.create({
    data: normalizeBigIntFields(data, ['id_utilisateur']),
  })

const findProfessionnelByUser = (id_utilisateur) =>
  prisma.professionnel.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: true },
  })

const updateProfessionnel = (id_utilisateur, data) =>
  prisma.professionnel.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data,
  })

const validerProfessionnel = (id_utilisateur) =>
  prisma.professionnel.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data: { est_valide_admin: true },
  })

module.exports = {
  createProfessionnel,
  findProfessionnelByUser,
  updateProfessionnel,
  validerProfessionnel,
}
